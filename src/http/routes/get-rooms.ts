import { count, eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { authenticate } from "../middlewares/authenticate.ts";
import type { JwtPayload } from "./types/jwt-payload.ts";

interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/rooms",
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const userId = (request as AuthenticatedRequest).user.sub;

      const results = await db
        .select({
          id: schema.rooms.id,
          name: schema.rooms.name,
          questionsCount: count(schema.questions.id),
          createdAt: schema.rooms.createdAt,
        })
        .from(schema.rooms)
        .leftJoin(
          schema.questions,
          eq(schema.questions.roomId, schema.rooms.id)
        )
        .where(eq(schema.rooms.userId, userId))
        .groupBy(schema.rooms.id, schema.rooms.name)
        .orderBy(schema.rooms.createdAt);

      return results;
    }
  );
};
