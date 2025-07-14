import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { UnauthorizedError } from "../errors/unauthorized-error.ts";
import type { JwtPayload } from "./types/jwt-payload.ts";

export async function getProfileRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      schema: {
        summary: "Get authenticated user profile",
        tags: ["auth"],
        response: {
          200: z.object({
            user: z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.string().email(),
              role: z.enum(["admin", "member"]),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { sub } = request.user as JwtPayload;

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, sub),
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError("User not found.");
      }

      return reply.send({ user });
    }
  );
}
