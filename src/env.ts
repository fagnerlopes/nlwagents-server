import { z } from 'zod'

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3333'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  GEMINI_API_KEY: z.string().min(30, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z
    .string()
    .min(10, 'GEMINI_MODEL is required')
    .default('gemini-2.5-pro'),
  GEMINI_MODEL_EMBEDDING: z.string().default('text-embedding-004'),
})

export const env = envSchema.parse(process.env)
