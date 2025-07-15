import { desc, eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const getRoomQuestionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/rooms/:roomId/questions",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;

      const results = await db
        .select({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
          createdAt: schema.questions.created_at,
          user: {
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          },
        })
        .from(schema.questions)
        .innerJoin(schema.users, eq(schema.questions.userId, schema.users.id))
        .where(eq(schema.questions.roomId, roomId))
        .orderBy(desc(schema.questions.created_at));

      return reply.status(200).send(results);
    }
  );
};
