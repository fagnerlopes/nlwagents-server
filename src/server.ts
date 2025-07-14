import fastifyCookie from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import { fastifyMultipart } from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.ts";
import { createQuestionRoute } from "./http/routes/create-question.ts";
import { createRoomRoute } from "./http/routes/create-room.ts";
import { createUserRoute } from "./http/routes/create-user.ts";
import { getRoomQuestionsRoute } from "./http/routes/get-room-questions.ts";
import { getRoomsRoute } from "./http/routes/get-rooms.ts";
import { healthCheckRoute } from "./http/routes/health-check.ts";
import { loginRoute } from "./http/routes/login.ts";
import { refreshTokenRoute } from "./http/routes/refresh-token.ts";
import { uploadAudioRoute } from "./http/routes/upload-audio.ts";
import { getProfileRoute } from "./http/routes/get-profile.ts";
import { logoutRoute } from "./http/routes/logout.ts";
import { ensureAuthenticated } from "./http/middlewares/decode-user.ts";

const app = fastify({
  logger: { level: "debug" },
}).withTypeProvider<ZodTypeProvider>();
const host = env.APP_ENV === "development" ? "0.0.0.0" : "localhost";
const corsOrigins = ["http://localhost:5173"];

app.register(fastifyCors, {
  origin: corsOrigins,
  credentials: true,
});

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
  keyGenerator: (req) => {
    if (req.user && typeof req.user === "object" && "id" in req.user) {
      return (req.user as { id: string }).id;
    }
    return req.ip;
  },
  ban: 2,
  errorResponseBuilder: (_req, context) => {
    return {
      statusCode: 429,
      error: "Too Many Requests",
      message: `Você excedeu o limite de ${
        context.max
      } requisições por minuto. Tente novamente em ${Math.ceil(
        context.ttl / 1000
      )} segundos.`,
    };
  },
  allowList: ["127.0.0.1"],
  skipOnError: true,
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET || "supersecret",
});

app.register(fastifyMultipart);
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.register(fastifyCookie);

// Rotas públicas
app.register(healthCheckRoute);
app.register(loginRoute);
app.register(refreshTokenRoute);
app.register(getRoomQuestionsRoute);
app.register(createQuestionRoute);
app.register(createUserRoute);
app.register(logoutRoute);

// Rotas autenticadas
app.register(async (authenticatedRoutes) => {
  authenticatedRoutes.addHook("onRequest", ensureAuthenticated);

  authenticatedRoutes.register(getRoomsRoute);
  authenticatedRoutes.register(createRoomRoute);
  authenticatedRoutes.register(uploadAudioRoute);
  authenticatedRoutes.register(getProfileRoute);
});

app.listen({ port: env.PORT, host });
