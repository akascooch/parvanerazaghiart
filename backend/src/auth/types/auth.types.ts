import { UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

export type AccessJwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access';
};

export type RefreshJwtPayload = {
  sub: string;
  jti: string;
  type: 'refresh';
};
