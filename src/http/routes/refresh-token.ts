import { eq } from "drizzle-orm";
import type { FastifyPluginCallback } from "fastify";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { generateJwtPair } from "../../lib/jwtGenerate.ts";

export const refreshTokenRoute: FastifyPluginCallback = (app) => {
  app.post("/refresh-token", async (request, reply) => {
    const refreshToken = request.cookies.refresh_token;
    const { authTokens } = schema;
    if (!refreshToken) {
      return reply
        .status(401)
        .send({ message: "Refresh token não encontrado." });
    }

    interface JwtPayload {
      userId: string;
      jti: string;
      [key: string]: unknown;
    }
    let payload: JwtPayload;
    try {
      payload = app.jwt.verify(refreshToken) as JwtPayload;
    } catch {
      return reply.status(401).send({ message: "Refresh token inválido." });
    }

    // Busca o token no banco
    const [tokenRecord] = await db
      .select()
      .from(authTokens)
      .where(eq(authTokens.jti, payload.jti));

    if (
      !tokenRecord ||
      tokenRecord.revoked ||
      new Date() > tokenRecord.expiresAt ||
      tokenRecord.refreshToken !== refreshToken
    ) {
      return reply
        .status(401)
        .send({ message: "Refresh token não encontrado ou já utilizado." });
    }

    // Gera novos tokens e novo JTI
    const {
      accessToken,
      refreshToken: newRefreshToken,
      jti: newJti,
    } = await generateJwtPair(app, {
      userId: payload.userId,
      payload: {},
    });

    // Revoga o refresh token antigo e salva o novo
    await db
      .update(authTokens)
      .set({ revoked: true })
      .where(eq(authTokens.jti, payload.jti));

    await db.insert(authTokens).values({
      userId: payload.userId,
      jti: newJti,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    // Seta o novo refresh token como cookie HTTP Only
    reply.setCookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    });

    return reply.status(200).send({ access_token: accessToken });
  });
};
