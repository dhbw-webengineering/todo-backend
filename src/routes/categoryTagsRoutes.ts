import { FastifyInstance } from "fastify";
import { getCategoryHandler, getTagsHandler} from "../controllers/categoryController";

export async function categoryRoutes(fastify: FastifyInstance) {

    fastify.get("/category", { preHandler: [fastify.authenticate] }, getCategoryHandler);

    fastify.get("/tags", { preHandler: [fastify.authenticate] }, getTagsHandler);
}