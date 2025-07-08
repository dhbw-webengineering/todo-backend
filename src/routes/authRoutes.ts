import { FastifyInstance } from "fastify";
import { loginHandler, logoutHandler, registerHandler } from "../controllers/authController";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", registerHandler);
  fastify.post("/login", loginHandler);
  fastify.post("/logout", logoutHandler);
}
