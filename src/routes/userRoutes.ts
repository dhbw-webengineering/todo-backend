import { FastifyInstance } from "fastify";
import { updateUserHandler } from "../controllers/userController";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.put("/user", {
    preHandler: [fastify.authenticate],
    handler: updateUserHandler,
  });
}