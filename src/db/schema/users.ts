import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "member"]);

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  name: text().notNull(),
  password: text().notNull(),
  role: roleEnum("role").default("member").notNull(),
  acceptsAds: boolean().default(false).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
