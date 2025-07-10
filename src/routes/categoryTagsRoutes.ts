import { FastifyInstance } from "fastify";
import {
    createCategoryHandler, deleteCategoryHandler,
    getCategoryHandler,
    getTagsHandler,
    updateCategoryHandler
} from "../controllers/categoryController";

export async function categoryRoutes(fastify: FastifyInstance) {

    fastify.get("/category", { preHandler: [fastify.authenticate] }, getCategoryHandler);
    fastify.post("/category", { preHandler: [fastify.authenticate] }, createCategoryHandler);
    fastify.patch("/category/:id", { preHandler: [fastify.authenticate] }, updateCategoryHandler);
    fastify.delete("/category/:id", { preHandler: [fastify.authenticate] }, deleteCategoryHandler);

    fastify.get("/tags", { preHandler: [fastify.authenticate] }, getTagsHandler);
}