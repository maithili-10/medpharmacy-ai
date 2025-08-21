// src/fitbit/token-store.ts
interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export const tokenStore: { [userId: string]: TokenData } = {};
