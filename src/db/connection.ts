import postgres from 'postgres'
import { env } from '../env.ts'

export const sql = postgres(env.DATABASE_URL, {
  max: 1,
  idle_timeout: 5,
  onnotice: (notice) => {
    console.warn('Postgres notice:', notice)
  },
})
