import type { FastifyRequest } from 'fastify'

export async function decodeUser(request: FastifyRequest) {
  try {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      const payload = (await request.jwtVerify()) as { userId: string }
      request.user = { id: payload.userId }
    }
  } catch {
    // Não lança erro, apenas não popula user
  }
}
