import { CookieOptions } from 'express';
import { env } from './env.js';

export const JWT_CONFIG = {
  accessSecret: env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET || `${env.JWT_SECRET}_refresh`,
  resetSecret: process.env.JWT_RESET_SECRET || `${env.JWT_SECRET}_reset`,
  accessExpiresIn: 15 * 60, // 15 minutes in seconds
  refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  resetExpiresIn: 15 * 60, // 15 minutes in seconds
};

export const getCookieOptions = (maxAgeMs: number): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: maxAgeMs,
  path: '/',
});

export const ACCESS_COOKIE_OPTIONS = getCookieOptions(15 * 60 * 1000); // 15 mins
export const REFRESH_COOKIE_OPTIONS = getCookieOptions(7 * 24 * 60 * 60 * 1000); // 7 days
