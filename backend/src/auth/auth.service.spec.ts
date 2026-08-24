import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { LoginRateLimitService } from './login-rate-limit.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const user = {
    id: 'user_1',
    email: 'admin@example.com',
    phone: '09123456789',
    name: 'Admin',
    role: UserRole.ADMIN,
    passwordHash: 'hashed',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock };
    refreshToken: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwt: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  let rateLimit: {
    assertAllowed: jest.Mock;
    recordFailure: jest.Mock;
    reset: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue('token'),
      verifyAsync: jest.fn(),
    };
    rateLimit = {
      assertAllowed: jest.fn(),
      recordFailure: jest.fn(),
      reset: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return undefined;
      }),
      getOrThrow: jest.fn(() => 'access-secret'),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
      rateLimit as unknown as LoginRateLimitService,
    );
  });

  it('returns a user without passwordHash on successful login', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.login(user.email, 'password12', 'ip:email');

    expect(rateLimit.reset).toHaveBeenCalled();
    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(result)).not.toContain('hashed');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('accepts a phone identifier', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.refreshToken.create.mockResolvedValue({});

    await service.login('09123456789', 'password12', 'ip:phone');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { phone: '09123456789' },
    });
  });

  it('rejects an inactive admin', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, isActive: false });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.login(user.email, 'password12', 'ip:email'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(rateLimit.recordFailure).toHaveBeenCalled();
  });

  it('rejects invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login(user.email, 'wrong-password', 'ip:email'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(rateLimit.recordFailure).toHaveBeenCalled();
  });
});
