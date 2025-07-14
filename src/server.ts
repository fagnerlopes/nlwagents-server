import fastifyCookie from '@fastify/cookie'
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
import { loginRoute } from './http/routes/login.ts'
import { refreshTokenRoute } from './http/routes/refresh-token.ts'
import { uploadAudioRoute } from './http/routes/upload-audio.ts'

const app = fastify({
  logger: { level: 'debug' },
}).withTypeProvider<ZodTypeProvider>()
const host = env.APP_ENV === 'development' ? '0.0.0.0' : 'localhost'
const corsOrigins = ['http://localhost:5173']

app.register(fastifyCors, {
  origin: corsOrigins,
  credentials: true,
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET || 'supersecret',
})

app.register(fastifyMultipart)
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(refreshTokenRoute)
app.register(fastifyCookie)

app.get('/health', () => {
  return 'OK'
})

app.register(loginRoute)
app.register(createUserRoute)
app.register(getRoomsRoute)
app.register(createRoomRoute)
app.register(getRoomQuestionsRoute)
app.register(createQuestionRoute)
app.register(uploadAudioRoute)

app.listen({ port: env.PORT, host })
