import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  name: text().notNull(),
  password: text().notNull(),
  acceptsAds: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})
