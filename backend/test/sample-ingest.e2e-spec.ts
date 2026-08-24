import { execFileSync } from 'child_process';
import path from 'path';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Studio Studies sample ingest (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it(
    'keeps four primary-ordered images when seed runs twice',
    async () => {
      const seed = path.join(__dirname, '..', 'prisma', 'seed.cjs');
      execFileSync(process.execPath, [seed], {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        stdio: 'pipe',
      });
      execFileSync(process.execPath, [seed], {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        stdio: 'pipe',
      });

      const artwork = await prisma.artwork.findUnique({
        where: { slug: 'studio-studies' },
        include: {
          category: true,
          media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        },
      });
      expect(artwork).toBeTruthy();
      expect(artwork?.title).toBe('Studio Studies');
      expect(artwork?.collection).toBe('Studio Studies');
      expect(artwork?.category?.name).toBe('Paintings');
      expect(artwork?.media).toHaveLength(4);
      expect(artwork?.media[0].isPrimary).toBe(true);
      expect(artwork?.media.map((item) => item.sortOrder)).toEqual([0, 1, 2, 3]);
      expect(artwork?.media.filter((item) => item.isPrimary)).toHaveLength(1);
    },
    120000,
  );
});
