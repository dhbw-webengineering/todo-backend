import { FastifyInstance } from "fastify";
import {
  getTodoHandler,
  createTodoHandler,
  updateTodoHandler,
  deleteTodoHandler,
} from "../controllers/todoController";

export async function todoRoutes(fastify: FastifyInstance) {
  // Liste aller Todos abrufen
  fastify.get("/todos", { preHandler: [fastify.authenticate] }, getTodoHandler);

  // Neues Todo erstellen
  fastify.post("/todos", { preHandler: [fastify.authenticate] }, createTodoHandler);

  // Ein Todo aktualisieren (z. B. per ID in Query)
  fastify.patch("/todos", { preHandler: [fastify.authenticate] }, updateTodoHandler);

  // Ein Todo löschen
  fastify.delete("/todos", { preHandler: [fastify.authenticate] }, deleteTodoHandler);
}