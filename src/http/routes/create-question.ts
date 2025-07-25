import { and, eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import type { FastifyRequest } from "fastify";
import z from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { generateAnswer, generateEmbeddings } from "../../services/gemini.ts";
import { authenticate } from "../middlewares/authenticate.ts";
import type { JwtPayload } from "./types/jwt-payload.ts";

interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/rooms/:roomId/questions",
    {
      preHandler: [authenticate],
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(3, "Question is required"),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { question } = request.body;
      const userId = (request as AuthenticatedRequest).user.sub;

      const embeddings = await generateEmbeddings(question);
      const embeddingsAsString = `[${embeddings.join(",")}]`;

      // busca os audio chunks mais similares a questão
      const chunks = await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
        })
        .from(schema.audioChunks)
        .where(
          and(
            eq(schema.audioChunks.roomId, roomId),
            sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
          )
        )
        .orderBy(
          sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`
        )
        .limit(3);

      let answer: string | null = null;

      if (chunks.length > 0) {
        const transcriptions = chunks.map((chunk) => chunk.transcription);

        answer = await generateAnswer(question, transcriptions);
      } else {
        console.warn("[WARNING] No similar content found for the question");
        answer =
          "Desculpe, não consegui encontrar uma resposta para a sua pergunta no conteúdo da live.";
      }

      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          userId,
          question,
          answer,
        })
        .returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error("Failed to create question");
      }

      return reply
        .status(201)
        .send({ questionId: insertedQuestion.id, answer });
    }
  );
};
