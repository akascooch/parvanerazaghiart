import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArtworkStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  resolveMediaSigningSecret,
  signMediaVariant,
} from './../src/media/media-signing';
import { MediaStorageService } from './../src/media/media-storage.service';
import { PrismaService } from './../src/prisma/prisma.service';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('Public gallery media (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  const email = `phase6-e2e-${Date.now()}@test.local`;
  const password = 'CorrectHorseBattery';
  let accessToken: string;
  let artworkId: string;
  let mediaId: string;
  let slug: string;

  function signature(variant: string) {
    const secret = resolveMediaSigningSecret({
      MEDIA_SIGNING_SECRET: process.env.MEDIA_SIGNING_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
    });
    return signMediaVariant(secret, mediaId, variant);
  }

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
    storage = app.get(MediaStorageService);

    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 12),
        name: 'Gallery E2E',
        role: UserRole.ADMIN,
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
      .send({ title: `Phase6 Public ${Date.now()}`, status: 'DRAFT' })
      .expect(201);
    artworkId = created.body.id;
    slug = created.body.slug;

    const uploaded = await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_1X1, { filename: 'pixel.png', contentType: 'image/png' })
      .expect(201);
    mediaId = uploaded.body.id;
  });

  afterAll(async () => {
    const media = await prisma.media.findMany({ where: { artworkId } });
    for (const item of media) {
      await storage.remove(item.storageKey);
      for (const variant of ['thumb', 'preview', 'full'] as const) {
        await storage.remove(`${artworkId}/deriv/${item.id}.${variant}`);
      }
      await storage.remove(`${artworkId}/deriv/${item.id}.original`);
    }
    await prisma.artwork.deleteMany({ where: { id: artworkId } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('keeps draft media off the public gallery', async () => {
    await request(app.getHttpServer())
      .get(`/api/public/media/${mediaId}/thumb?s=${signature('thumb')}`)
      .expect(404);

    const list = await request(app.getHttpServer())
      .get('/api/public/artworks')
      .expect(200);
    expect(list.body.items.some((item: { id: string }) => item.id === artworkId)).toBe(
      false,
    );
  });

  it('rejects missing or invalid signatures even after publish', async () => {
    await request(app.getHttpServer())
      .patch(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: ArtworkStatus.PUBLISHED })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/public/media/${mediaId}/thumb`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/api/public/media/${mediaId}/thumb?s=not-a-valid-signature-value`)
      .expect(404);
  });

  it('serves signed public derivatives for published artworks', async () => {
    const file = await request(app.getHttpServer())
      .get(`/api/public/media/${mediaId}/thumb?s=${signature('thumb')}`)
      .expect(200);
    expect(file.headers['content-type']).toContain('image/png');
    expect(file.headers['cache-control']).toContain('public');
    expect(file.headers.etag).toBeDefined();

    const cached = await request(app.getHttpServer())
      .get(`/api/public/media/${mediaId}/thumb?s=${signature('thumb')}`)
      .set('If-None-Match', file.headers.etag)
      .expect(304);
    expect(cached.headers.etag).toBe(file.headers.etag);
    expect(file.headers['x-content-type-options']).toBe('nosniff');

    const detail = await request(app.getHttpServer())
      .get(`/api/public/artworks/${slug}`)
      .expect(200);
    expect(detail.body.slug).toBe(slug);
    expect(detail.body.media[0].src.thumb).toContain(`/api/public/media/${mediaId}/thumb`);
    expect(detail.body.media[0].src.thumb).not.toContain('storage');
  });

  it('still requires admin JWT for original private files', async () => {
    await request(app.getHttpServer())
      .get(`/api/admin/media/${mediaId}/file`)
      .expect(401);

    const original = await request(app.getHttpServer())
      .get(`/api/admin/media/${mediaId}/file`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(original.headers['cache-control']).toContain('private');
    expect(original.headers['cache-control']).toContain('no-store');
  });
});
