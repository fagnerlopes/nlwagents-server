import { eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { env } from "../../env.ts";
import { generateJwtPair } from "../../lib/jwtGenerate.ts";
import { verifyPasswordFromHash } from "../../lib/passwordCrypt.ts";

export const loginRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/login",
    {
      schema: {
        body: z.object({
          email: z.email("Name is required"),
          password: z.string("Password is required"),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const isValidPassword = await verifyPasswordFromHash(
        password,
        user.password
      );

      if (!isValidPassword) {
        throw new Error("Email ou senha incorreta");
      }

      const { accessToken, refreshToken, jti } = await generateJwtPair(app, {
        userId: user.id,
        payload: { sub: user.id, email: user.email },
      });

      await db.insert(schema.authTokens).values({
        userId: user.id,
        jti,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      });

      // Seta o refresh token como cookie HTTP Only
      reply.setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: env.APP_ENV === "production",
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      });

      return reply.status(200).send({
        access_token: accessToken,
      });
    }
  );
};
