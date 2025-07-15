import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import z from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { authenticate } from "../middlewares/authenticate.ts";
import type { JwtPayload } from "./types/jwt-payload.ts";

interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export const createRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/rooms",
    {
      preHandler: [authenticate],
      schema: {
        body: z.object({
          name: z.string().min(1, "Name is required"),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, description } = request.body;
      const userId = (request as AuthenticatedRequest).user.sub;

      const room = await db
        .insert(schema.rooms)
        .values({
          name,
          description: description || "",
          userId,
        })
        .returning();

      const insertedRoom = room[0];

      if (!insertedRoom) {
        throw new Error("Failed to create room");
      }

      return reply.status(201).send({ roomId: insertedRoom.id });
    }
  );
};
