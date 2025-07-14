import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import { env } from "../../env.ts";

export async function logoutRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/logout",
    {
      schema: {
        summary: "Log out the user",
        tags: ["auth"],
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { refresh_token: refreshTokenFromCookie } = request.cookies;

      if (refreshTokenFromCookie) {
        try {
          const { jti } = app.jwt.verify<{ jti: string }>(
            refreshTokenFromCookie
          );
          await db
            .update(schema.authTokens)
            .set({ revoked: true })
            .where(eq(schema.authTokens.jti, jti));
        } catch {
          // O token pode ser inválido ou expirado, o que não é um problema.
          // O objetivo é deslogar o usuário, então seguimos para limpar o cookie.
        }
      }

      reply.clearCookie("refresh_token", {
        path: "/",
        httpOnly: true,
        secure: env.APP_ENV === "production",
        sameSite: "lax",
      });

      return reply.status(204).send();
    }
  );
}
