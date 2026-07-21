import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('supersecretkey_change_in_production'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
