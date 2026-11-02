import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default('*'),
  /** OpenWeatherMap API key; optional — weather route returns `available: false` when unset or blank. */
  WEATHER_API_KEY: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().min(1).optional(),
  ),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  ADMIN_SEED_EMAIL: z.string().email().default('admin@authority.local'),
  ADMIN_SEED_PASSWORD: z.string().min(6).optional(),
  ADMIN_SEED_NAME: z.string().min(2).default('Authority Admin'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}

export function isCloudinaryConfigured(env: Env): boolean {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}
