import type { FastifyRequest } from "fastify";
import type { JwtPayload } from "../routes/types/jwt-payload.ts";

export async function decodeUser(request: FastifyRequest) {
  try {
    const auth = request.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      const payload = (await request.jwtVerify()) as JwtPayload;
      request.user = payload;
    }
  } catch {
    // Não lança erro, apenas não popula user
  }
}
