import { z } from 'zod'
import { env } from 'node:process';
import 'dotenv/config';

const envSchema = z.object({
    JWT_SECRET: z.string().min(32),
    DATABASE_URL: z.string().url(),
    COOKIE_SECRET: z.string().min(32),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().default(3001),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_FROM: z.string().default('Todo-Webapp'),
})

export const e = envSchema.parse(env)
