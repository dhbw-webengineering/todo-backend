import { FastifyInstance } from "fastify";
import { loginHandler, registerHandler } from "../controllers/authController";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", registerHandler);
  fastify.post("/login", loginHandler);
}
