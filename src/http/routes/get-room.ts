import { desc, eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const getRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/rooms/:roomId",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;

      const result = await db
        .select({
          id: schema.rooms.id,
          name: schema.rooms.name,
          description: schema.rooms.description,
          createdAt: schema.rooms.createdAt,
          creator: schema.users.name,
        })
        .from(schema.rooms)
        .innerJoin(schema.users, eq(schema.rooms.userId, schema.users.id))
        .where(eq(schema.rooms.id, roomId));

      return reply.status(200).send(result);
    }
  );
};
