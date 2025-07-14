// Barrel file for schema exports
import { audioChunks } from './audio-chunks.ts'
import { authTokens } from './auth-tokens.ts'
import { questions } from './questions.ts'
import { rooms } from './rooms.ts'
import { users } from './users.ts'

export const schema = {
  rooms,
  questions,
  audioChunks,
  users,
  authTokens,
}
