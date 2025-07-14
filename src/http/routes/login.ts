import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { verifyPasswordFromHash } from '../../lib/passwordCrypt.ts'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/login',
    {
      schema: {
        body: z.object({
          email: z.email('Name is required'),
          password: z.string('Password is required'),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      const isValidPassword = await verifyPasswordFromHash(
        password,
        user.password
      )

      if (!isValidPassword) {
        throw new Error('Email ou senha incorreta')
      }

      const token = app.jwt.sign({
        sub: user.id,
        email: user.email,
      })

      return reply.status(200).send({ bearer_token: token })
    }
  )
}
