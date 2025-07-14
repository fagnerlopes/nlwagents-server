import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'

export const healthCheckRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/health', () => {
    return {
      status: 'OK',
      service: 'NLW Agent API',
      date: new Date().toISOString(),
    }
  })
}
