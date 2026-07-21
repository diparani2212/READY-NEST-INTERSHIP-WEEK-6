import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const DEFAULT_DATABASE_URL =
  'postgresql://smart_hospital_7zjn_user:dWlvE3H9juIGPeiR1AhbZdUWFc6oEdiA@dpg-d9fhk23rjlhs73abufh0-a.ohio-postgres.render.com/smart_hospital_7zjn';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.string().default('production'),
  DATABASE_URL: z.string().default(DEFAULT_DATABASE_URL),
  JWT_SECRET: z.string().default('supersecretkey_change_in_production'),
  CORS_ORIGIN: z.string().default('*'),
  FRONTEND_URL: z.string().default('*'),
});

const rawEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
};

export const env = envSchema.parse(rawEnv);
