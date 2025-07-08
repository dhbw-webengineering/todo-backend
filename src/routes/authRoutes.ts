import { FastifyInstance } from "fastify";
import { loginHandler, logoutHandler, meHandler, registerHandler } from "../controllers/authController";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", registerHandler);
  fastify.post("/login", loginHandler);
  fastify.post("/logout", logoutHandler);
  fastify.get("/me", meHandler)
}
