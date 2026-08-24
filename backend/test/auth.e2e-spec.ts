import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = `phase2-e2e-${Date.now()}@test.local`;
  const password = 'CorrectHorseBattery';

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

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'E2E Admin',
        role: UserRole.ADMIN,
      },
    });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('logs in with a phone identifier', async () => {
    const phone = `09${String(Date.now()).slice(-9)}`;
    await prisma.user.update({ where: { email }, data: { phone } });

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: phone, password })
      .expect(200);
    expect(login.body.user.email).toBe(email);
    expect(login.body.accessToken).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('logs in, reads /me, and omits the password hash', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(login.body.user.email).toBe(email);
    expect(login.body.user.passwordHash).toBeUndefined();
    expect(login.body.accessToken).toBeDefined();

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);

    const me = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(me.body.user.email).toBe(email);
    expect(me.body.user.passwordHash).toBeUndefined();
  });

  it('revokes refresh on logout and is idempotent', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send({ refreshToken: login.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send({ refreshToken: login.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer()).post('/api/auth/logout').expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);
  });
});
