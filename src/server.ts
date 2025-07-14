import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { fastifyMultipart } from '@fastify/multipart'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env.ts'
import { createQuestionRoute } from './http/routes/create-question.ts'
import { createRoomRoute } from './http/routes/create-room.ts'
import { createUserRoute } from './http/routes/create-user.ts'
import { getRoomQuestionsRoute } from './http/routes/get-room-questions.ts'
import { getRoomsRoute } from './http/routes/get-rooms.ts'
import { uploadAudioRoute } from './http/routes/upload-audio.ts'

const app = fastify({
  logger: { level: 'debug' },
}).withTypeProvider<ZodTypeProvider>()
const host = env.APP_ENV === 'development' ? '0.0.0.0' : 'localhost'
const corsOrigins =
  env.APP_ENV === 'development'
    ? ['*']
    : [env.APP_URL, 'http://192.168.0.15:5173']

app.register(fastifyCors, {
  origin: corsOrigins,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET || 'supersecret',
})

app.register(fastifyMultipart)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', () => {
  return 'OK'
})

app.register(createUserRoute)
app.register(getRoomsRoute)
app.register(createRoomRoute)
app.register(getRoomQuestionsRoute)
app.register(createQuestionRoute)
app.register(uploadAudioRoute)

app.listen({ port: env.PORT, host })
