import { createHash, randomUUID } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginRateLimitService } from './login-rate-limit.service';
import { isPhoneIdentifier, normalizePhone } from './phone';
import type {
  AccessJwtPayload,
  AuthUser,
  RefreshJwtPayload,
  TokenPair,
} from './types/auth.types';

const DUMMY_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEeOqNRGsYkKqXqW8q0nGqk2vQv0nGqk2vQq';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly loginRateLimit: LoginRateLimitService,
  ) {}

  getStatus() {
    return { module: 'auth', ready: true, phase: 3 };
  }

  async login(
    identifier: string,
    password: string,
    throttleKey: string,
  ): Promise<{ user: AuthUser } & TokenPair> {
    this.loginRateLimit.assertAllowed(throttleKey);

    const user = await this.findUserByIdentifier(identifier);
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const matches = await bcrypt.compare(password, hash);

    if (!user || !user.isActive || !matches) {
      this.loginRateLimit.recordFailure(throttleKey);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.loginRateLimit.reset(throttleKey);
    const tokens = await this.issueTokens(user);
    return { user: this.toAuthUser(user), ...tokens };
  }

  private async findUserByIdentifier(identifier: string) {
    const phone = isPhoneIdentifier(identifier)
      ? normalizePhone(identifier)
      : null;
    if (phone) {
      return this.prisma.user.findUnique({ where: { phone } });
    }
    return this.prisma.user.findUnique({
      where: { email: identifier.trim().toLowerCase() },
    });
  }

  async refresh(refreshToken: string): Promise<{ user: AuthUser } & TokenPair> {
    const payload = await this.verifyRefresh(refreshToken);
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.userId !== payload.sub ||
      stored.id !== payload.jti ||
      stored.expiresAt.getTime() <= Date.now()
    ) {
      if (payload.sub) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user);
    return { user: this.toAuthUser(stored.user), ...tokens };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const jti = randomUUID();
    const refreshExpiresIn =
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const accessExpiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const expiresAt = new Date(
      Date.now() + this.parseExpiryMs(refreshExpiresIn),
    );

    const accessPayload: AccessJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    const refreshPayload: RefreshJwtPayload = {
      sub: user.id,
      jti,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, { expiresIn: accessExpiresIn }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.refreshSecret(),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken, expiresIn: accessExpiresIn };
  }

  private async verifyRefresh(token: string): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshJwtPayload>(token, {
        secret: this.refreshSecret(),
      });
      if (payload.type !== 'refresh' || !payload.sub || !payload.jti) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private refreshSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      `${this.config.getOrThrow<string>('JWT_SECRET')}:refresh`
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private parseExpiryMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? multipliers.d);
  }
}
