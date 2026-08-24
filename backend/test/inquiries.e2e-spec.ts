import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Public inquiries (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const stamp = Date.now();
  const email = `phase8-inquiry-${stamp}@test.local`;
  const password = 'CorrectHorseBattery';
  let accessToken: string;
  let artworkId: string;
  let slug: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
        name: 'Inquiry E2E',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    accessToken = login.body.accessToken;

    const created = await request(app.getHttpServer())
      .post('/api/admin/artworks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Phase8 Inquiry ${stamp}`,
        status: 'PUBLISHED',
        price: 88000000,
        isPriceVisible: false,
      })
      .expect(201);
    artworkId = created.body.id;
    slug = created.body.slug;
  });

  afterAll(async () => {
    await prisma.inquiry.deleteMany({
      where: { OR: [{ artworkId }, { contact: { contains: `phase8-${stamp}` } }] },
    });
    if (artworkId) {
      await prisma.artwork.deleteMany({ where: { id: artworkId } });
    }
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('stores a public enquiry without leaking hidden price', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/public/inquiries')
      .send({
        name: 'Collector',
        contact: `phase8-${stamp}@example.com`,
        artworkSlug: slug,
        message: 'I would like availability and a private quote for this work.',
      })
      .expect(201);
    expect(created.body.received).toBe(true);
    expect(created.body.price).toBeUndefined();
    expect(created.body.isPriceVisible).toBeUndefined();

    const publicArtwork = await request(app.getHttpServer())
      .get(`/api/public/artworks/${slug}`)
      .expect(200);
    expect(publicArtwork.body.price).toBeNull();

    const listed = await request(app.getHttpServer())
      .get('/api/admin/inquiries')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const match = listed.body.find((row: { artworkSlug?: string }) => row.artworkSlug === slug);
    expect(match).toBeDefined();
    expect(match.contact).toContain(`phase8-${stamp}`);
    expect(match.price).toBeUndefined();
    expect(JSON.stringify(match)).not.toContain('88000000');
  });

  it('ignores honeypot spam without creating a row', async () => {
    const before = await prisma.inquiry.count();
    await request(app.getHttpServer())
      .post('/api/public/inquiries')
      .send({
        name: 'Bot',
        contact: `spam-${stamp}@example.com`,
        message: 'This is a sufficiently long spam message.',
        website: 'https://spam.example',
      })
      .expect(201);
    const after = await prisma.inquiry.count();
    expect(after).toBe(before);
  });

  it('rejects unauthenticated admin listing', async () => {
    await request(app.getHttpServer()).get('/api/admin/inquiries').expect(401);
  });

  it('returns a sanitized validation error without DTO metadata', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/public/inquiries')
      .send({ name: 'A', contact: 'x', message: 'short' })
      .expect(400);
    expect(res.body.message).toBe('Please check the form and try again.');
    expect(JSON.stringify(res.body)).not.toMatch(
      /must be|class-validator|CreateInquiryDto/i,
    );
  });
});
