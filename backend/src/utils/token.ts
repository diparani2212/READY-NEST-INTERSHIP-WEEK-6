import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { JWT_CONFIG, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from '../config/jwt.js';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_CONFIG.accessSecret, {
    expiresIn: JWT_CONFIG.accessExpiresIn,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpiresIn,
  });
}

export function generateResetToken(userId: string, currentPasswordHash: string): string {
  const secret = `${JWT_CONFIG.resetSecret}_${currentPasswordHash}`;
  return jwt.sign({ userId }, secret, {
    expiresIn: JWT_CONFIG.resetExpiresIn,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_CONFIG.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_CONFIG.refreshSecret) as TokenPayload;
}

export function verifyResetToken(token: string, currentPasswordHash: string): { userId: string } {
  const secret = `${JWT_CONFIG.resetSecret}_${currentPasswordHash}`;
  return jwt.verify(token, secret) as { userId: string };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
}

export function clearAuthCookies(res: Response) {
  res.cookie('accessToken', '', { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  res.cookie('refreshToken', '', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
}
