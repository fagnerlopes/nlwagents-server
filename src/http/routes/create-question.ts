import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(3, 'Question is required'),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      const createdQuestion = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
        })
        .returning()

      const insertedQuestion = createdQuestion[0]

      if (!insertedQuestion) {
        throw new Error('Failed to create question')
      }

      return reply.status(201).send(insertedQuestion.id)
    }
  )
}
