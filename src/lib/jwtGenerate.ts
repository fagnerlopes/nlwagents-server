import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'

interface GenerateJwtOptions {
  userId: string
  payload?: Record<string, unknown>
  accessTokenExpiresIn?: string
  refreshTokenExpiresIn?: string
}

export async function generateJwtPair(
  app: FastifyInstance,
  options: GenerateJwtOptions
) {
  const jti = randomUUID()
  const accessToken = await app.jwt.sign(
    { userId: options.userId, jti, ...options.payload },
    { expiresIn: options.accessTokenExpiresIn ?? '1d' } // access_token dura 1 dia
  )
  const refreshToken = await app.jwt.sign(
    { userId: options.userId, jti },
    { expiresIn: options.refreshTokenExpiresIn ?? '7d' } // refresh_token dura 7 dias
  )
  return { accessToken, refreshToken, jti }
}
