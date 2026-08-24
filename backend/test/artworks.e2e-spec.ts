import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Admin artworks (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = `phase4-e2e-${Date.now()}@test.local`;
  const password = 'CorrectHorseBattery';
  let accessToken: string;
  let artworkId: string;

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
        name: 'Artworks E2E',
        role: UserRole.ADMIN,
      },
    });

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.artwork.deleteMany({ where: { slug: { startsWith: 'phase4-e2e' } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('rejects unauthenticated artwork list', async () => {
    await request(app.getHttpServer()).get('/api/admin/artworks').expect(401);
  });

  it('rejects invalid create payloads', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/artworks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'A' })
      .expect(400);
    expect(res.body.message).toBe('Please check the form and try again.');
    expect(JSON.stringify(res.body)).not.toMatch(/must be|CreateArtwork/i);
  });

  it('creates, lists, and soft-deletes an artwork', async () => {
    const title = `Phase4 E2E Canvas ${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/api/admin/artworks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title, status: 'DRAFT' })
      .expect(201);

    artworkId = created.body.id;
    expect(created.body.title).toBe(title);
    expect(created.body.slug).toContain('phase4-e2e-canvas');

    const list = await request(app.getHttpServer())
      .get('/api/admin/artworks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.items.some((item: { id: string }) => item.id === artworkId)).toBe(
      true,
    );

    await request(app.getHttpServer())
      .delete(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    const deletedList = await request(app.getHttpServer())
      .get('/api/admin/artworks?deleted=true')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(
      deletedList.body.items.some((item: { id: string }) => item.id === artworkId),
    ).toBe(true);

    await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
