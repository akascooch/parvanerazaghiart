import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { MediaStorageService } from './../src/media/media-storage.service';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('Admin media (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  const email = `phase5-e2e-${Date.now()}@test.local`;
  const password = 'CorrectHorseBattery';
  let accessToken: string;
  let artworkId: string;
  let mediaId: string;

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
        name: 'Media E2E',
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
      .send({ title: `Phase5 E2E Media ${Date.now()}`, status: 'DRAFT' })
      .expect(201);
    artworkId = created.body.id;
  });

  afterAll(async () => {
    const media = await prisma.media.findMany({ where: { artworkId } });
    for (const item of media) {
      await storage.remove(item.storageKey);
    }
    await prisma.artwork.deleteMany({ where: { id: artworkId } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('rejects unauthenticated uploads', async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .attach('file', PNG_1X1, { filename: 'pixel.png', contentType: 'image/png' })
      .expect(401);
  });

  it('rejects non-image payloads', async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'pixel.png',
        contentType: 'image/png',
      })
      .expect(400);
  });

  it('uploads, marks primary, and refuses deleted artworks', async () => {
    const uploaded = await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_1X1, { filename: 'pixel.png', contentType: 'image/png' })
      .expect(201);

    mediaId = uploaded.body.id;
    expect(uploaded.body.isPrimary).toBe(true);
    expect(uploaded.body.mimeType).toBe('image/png');
    expect(uploaded.body.storageKey).toBeUndefined();

    const file = await request(app.getHttpServer())
      .get(`/api/admin/media/${mediaId}/file`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(file.headers['content-type']).toContain('image/png');

    await request(app.getHttpServer())
      .patch(`/api/admin/artworks/${artworkId}/media/${mediaId}/primary`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_1X1, { filename: 'pixel.png', contentType: 'image/png' })
      .expect(409);
  });
});
