import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/connection.ts";
import { eq } from "drizzle-orm";
import { schema } from "../../db/schema/index.ts";
import type { JwtPayload } from "../routes/types/jwt-payload.ts";

export async function ensureAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payload = await request.jwtVerify<JwtPayload>();

    const [tokenRecord] = await db
      .select({ revoked: schema.authTokens.revoked })
      .from(schema.authTokens)
      .where(eq(schema.authTokens.jti, payload.jti));

    if (!tokenRecord || tokenRecord.revoked) {
      return reply.status(401).send({ message: "Token has been revoked." });
    }
  } catch (err) {
    return reply.status(401).send({ message: "Authentication required." });
  }
}
