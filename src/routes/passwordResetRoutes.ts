import { FastifyInstance } from "fastify";
import {
  requestPasswordResetHandler,
  resetPasswordHandler,
  verifyResetTokenHandler,
} from "../controllers/passwordResetController";

export async function passwordResetRoutes(fastify: FastifyInstance) {
  fastify.post("/reset-password-request", requestPasswordResetHandler);
  fastify.post("/reset-password", resetPasswordHandler);
  fastify.get("/reset-password-token-verify", verifyResetTokenHandler);
}