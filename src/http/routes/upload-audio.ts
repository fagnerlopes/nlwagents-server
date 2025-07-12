import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts'

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params

      console.debug('Start upload audio for room:', roomId)

      const audio = await request.file()

      if (!audio) {
        console.error('Audios is required')
        throw new Error('Audios is required')
      }

      // Armazena todo o conteúdo do áudio em um buffer
      const audioBuffer = await audio.toBuffer()

      if (!audioBuffer) {
        console.error('Failed to read audio file')
        throw new Error('Failed to read audio file')
      }

      // Converte o buffer para base64
      // Isso é necessário para enviar o áudio para a API do Gemini
      // e também para armazenar no banco de dados se necessário
      const audioAsBase64 = audioBuffer.toString('base64')

      // 1. Transcrever o audio
      const transcription = await transcribeAudio(audioAsBase64, audio.mimetype)

      console.debug(
        'Audio uploaded and transcribed successfully',
        transcription
      )

      if (!transcription) {
        console.error('Transcription failed')
        throw new Error('Transcription failed')
      }

      // 2. Gerar o vetor semântico / embeddings
      const embeddings = await generateEmbeddings(transcription)

      // 3. Armazenar os vetores no banco de dados
      const result = await db
        .insert(schema.audioChunks)
        .values({
          roomId,
          transcription,
          embeddings,
        })
        .returning()

      const chunk = result[0]

      if (!chunk) {
        console.error('Failed to store audio chunk in database')
        throw new Error('Failed to store audio chunk in database')
      }

      // 4. Retornar o ID do chunk criado
      return reply.status(201).send({ chunkId: chunk.id })
    }
  )
}
