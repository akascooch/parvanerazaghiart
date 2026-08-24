import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MediaStorageService } from './../src/media/media-storage.service';
import { PrismaService } from './../src/prisma/prisma.service';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('Catalog phase 6.1 (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: MediaStorageService;
  const stamp = Date.now();
  const email = `phase61-e2e-${stamp}@test.local`;
  const phone = `09${String(stamp).slice(-9)}`;
  const password = 'CorrectHorseBattery';
  let accessToken: string;
  let categoryId: string;
  let categorySlug: string;
  let artworkId: string;
  let slug: string;
  const extraArtworkIds: string[] = [];
  const mediaIds: string[] = [];

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
        phone,
        passwordHash: await bcrypt.hash(password, 12),
        name: 'Phase 6.1 E2E',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    if (artworkId) {
      const media = await prisma.media.findMany({ where: { artworkId } });
      for (const item of media) {
        await storage.remove(item.storageKey);
        await storage.remove(`${artworkId}/deriv/${item.id}.thumb`);
        await storage.remove(`${artworkId}/deriv/${item.id}.preview`);
        await storage.remove(`${artworkId}/deriv/${item.id}.full`);
        await storage.remove(`${artworkId}/deriv/${item.id}.original`);
      }
      await prisma.artwork.deleteMany({
        where: { id: { in: [artworkId, ...extraArtworkIds] } },
      });
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('logs in with the phone identifier', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: phone, password })
      .expect(200);
    accessToken = login.body.accessToken;
    expect(login.body.user.email).toBe(email);
    expect(login.body.user.passwordHash).toBeUndefined();
  });

  it('creates a category and binds it to an artwork', async () => {
    const category = await request(app.getHttpServer())
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Phase61 Oils ${stamp}`, sortOrder: 1 })
      .expect(201);
    categoryId = category.body.id;
    categorySlug = category.body.slug;

    const created = await request(app.getHttpServer())
      .post('/api/admin/artworks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Phase61 Canvas ${stamp}`,
        status: 'PUBLISHED',
        price: 1250,
        isPriceVisible: false,
        technique: 'Oil on canvas',
        categoryId,
      })
      .expect(201);

    artworkId = created.body.id;
    slug = created.body.slug;
    expect(created.body.category.id).toBe(categoryId);
    expect(created.body.technique).toBe('Oil on canvas');
    expect(created.body.isPriceVisible).toBe(false);
    expect(Number(created.body.price)).toBe(1250);
  });

  it('hides price on public endpoints until the toggle is on', async () => {
    const hidden = await request(app.getHttpServer())
      .get(`/api/public/artworks/${slug}`)
      .expect(200);
    expect(hidden.body.price).toBeNull();
    expect(hidden.body.category.id).toBe(categoryId);

    const admin = await request(app.getHttpServer())
      .get(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Number(admin.body.price)).toBe(1250);
    expect(admin.body.isPriceVisible).toBe(false);

    await request(app.getHttpServer())
      .patch(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isPriceVisible: true })
      .expect(200);

    const visible = await request(app.getHttpServer())
      .get(`/api/public/artworks/${slug}`)
      .expect(200);
    expect(Number(visible.body.price)).toBe(1250);
  });

  it('uploads, reorders, sets primary, and deletes media', async () => {
    const first = await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_1X1, { filename: 'one.png', contentType: 'image/png' })
      .expect(201);
    const second = await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_1X1, { filename: 'two.png', contentType: 'image/png' })
      .expect(201);

    mediaIds.push(first.body.id, second.body.id);
    expect(first.body.isPrimary).toBe(true);
    expect(second.body.isPrimary).toBe(false);

    const reordered = await request(app.getHttpServer())
      .patch(`/api/admin/artworks/${artworkId}/media/reorder`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ids: [second.body.id, first.body.id] })
      .expect(200);
    expect(reordered.body[0].id).toBe(second.body.id);
    expect(reordered.body[0].sortOrder).toBe(0);

    const primed = await request(app.getHttpServer())
      .patch(`/api/admin/artworks/${artworkId}/media/${second.body.id}/primary`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const primary = primed.body.find((item: { isPrimary: boolean }) => item.isPrimary);
    expect(primary.id).toBe(second.body.id);

    await request(app.getHttpServer())
      .delete(`/api/admin/artworks/${artworkId}/media/${first.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const remaining = await request(app.getHttpServer())
      .get(`/api/admin/artworks/${artworkId}/media`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(remaining.body).toHaveLength(1);
    expect(remaining.body[0].id).toBe(second.body.id);
    expect(remaining.body[0].isPrimary).toBe(true);
  });

  it('updates collection metadata without rewriting the slug from the title', async () => {
    const updated = await request(app.getHttpServer())
      .patch(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Phase61 Canvas ${stamp} Revised`,
        collection: 'Studio Studies',
        year: 2024,
        dimensions: '120 x 90 cm',
      })
      .expect(200);
    expect(updated.body.slug).toBe(slug);
    expect(updated.body.collection).toBe('Studio Studies');
    expect(updated.body.year).toBe(2024);
  });

  it('filters the public catalog by category, collection, and title', async () => {
    const list = await request(app.getHttpServer())
      .get('/api/public/artworks')
      .query({
        category: categorySlug,
        collection: 'Studio Studies',
        q: 'Canvas',
      })
      .expect(200);
    expect(list.body.items.some((item: { id: string }) => item.id === artworkId)).toBe(
      true,
    );
    expect(list.body.facets.collections).toEqual(
      expect.arrayContaining(['Studio Studies']),
    );

    const missed = await request(app.getHttpServer())
      .get('/api/public/artworks')
      .query({ collection: 'Does Not Exist' })
      .expect(200);
    expect(missed.body.items.some((item: { id: string }) => item.id === artworkId)).toBe(
      false,
    );
  });

  it('excludes drafts and soft-deleted artworks from the public catalog', async () => {
    const draft = await request(app.getHttpServer())
      .post('/api/admin/artworks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: `Phase61 Draft ${stamp}`, status: 'DRAFT' })
      .expect(201);
    extraArtworkIds.push(draft.body.id);

    const publicList = await request(app.getHttpServer())
      .get('/api/public/artworks')
      .expect(200);
    expect(publicList.body.items.some((item: { id: string }) => item.id === draft.body.id)).toBe(
      false,
    );
    await request(app.getHttpServer())
      .get(`/api/public/artworks/${draft.body.slug}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/admin/artworks/${artworkId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/public/artworks/${slug}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/admin/artworks/${artworkId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
