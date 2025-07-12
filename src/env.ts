import { z } from 'zod'

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3333'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
})

export const env = envSchema.parse(process.env)
