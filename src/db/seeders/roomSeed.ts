import { reset, seed } from 'drizzle-seed'
import { db, sql } from '../connection.ts'
import { schema } from '../schema/index.ts'

await reset(db, schema)

await seed(db, schema).refine((f) => {
  return {
    rooms: {
      count: 20,
      columns: {
        name: f.companyName(),
        description: f.loremIpsum(),
      },
      with: {
        questions: 20,
      },
    },
    questions: {
      columns: {
        question: f.loremIpsum(),
        answer: f.loremIpsum(),
      },
    },
  }
})

await sql.end()

console.log('Database seeded successfully.')
