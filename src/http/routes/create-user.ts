import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { getHashFromPassword } from '../../lib/passwordCrypt.ts'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/create-user',
    {
      schema: {
        body: z.object({
          name: z.string().min(3, 'Name is required'),
          email: z.email('Name is required'),
          password: z.string(),
          acceptsAds: z.boolean().default(false).optional(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { name, email, password, acceptsAds } = request.body

        const [userExists] = await db
          .select({ email: schema.users.email })
          .from(schema.users)
          .where(eq(schema.users.email, email))

        if (userExists) {
          console.warn('Email already exists')
          return reply.status(409).send({ message: 'Email already exists' })
        }

        const hash = await getHashFromPassword(password)

        if (!hash) {
          throw new Error('Failed to create user')
        }

        const user = await db
          .insert(schema.users)
          .values({
            name,
            email,
            password: hash,
            acceptsAds: acceptsAds ?? false,
          })
          .returning()

        const insertedUser = user[0]

        if (!insertedUser) {
          throw new Error('Failed to create user')
        }

        return reply.status(201).send({ userId: insertedUser.id })
      } catch (error) {
        console.log(error)
        return reply.status(500).send({ message: 'Failed create User' })
      }
    }
  )
}
