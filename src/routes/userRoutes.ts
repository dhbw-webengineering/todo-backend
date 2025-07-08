import { FastifyInstance } from "fastify";
import { getUserHandler, updateUserHandler } from "../controllers/userController";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.put("/user", {
    preHandler: [fastify.authenticate],
    handler: updateUserHandler,
  });
  fastify.get("/me", {
    preHandler: [fastify.authenticate],
    handler: getUserHandler,
  });
}