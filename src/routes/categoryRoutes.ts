import { FastifyInstance } from "fastify";
import { getCategoryHandler } from "../controllers/categoryController";

export async function categoryRoutes(fastify: FastifyInstance) {

    fastify.get("/category", { preHandler: [fastify.authenticate] }, getCategoryHandler);
}