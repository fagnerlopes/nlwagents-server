// Barrel file for schema exports
import { audioChunks } from './audio-chunks.ts'
import { questions } from './questions.ts'
import { rooms } from './rooms.ts'
import { users } from './users.ts'

export const schema = {
  rooms,
  questions,
  audioChunks,
  users,
}
