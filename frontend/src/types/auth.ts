export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN';
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};
