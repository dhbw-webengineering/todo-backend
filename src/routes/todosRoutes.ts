import { FastifyInstance } from "fastify";
import {
  getTodoHandler,
  createTodoHandler,
  updateTodoHandler,
  deleteTodoHandler,
  todoSearchHandler,
} from "../controllers/todoController";

export async function todoRoutes(fastify: FastifyInstance) {
  // Liste aller Todos abrufen
  fastify.get("/todos", { preHandler: [fastify.authenticate] }, getTodoHandler);

  // Neues Todo erstellen
  fastify.post("/todos", { preHandler: [fastify.authenticate] }, createTodoHandler);

  // Ein Todo aktualisieren (z. B. per ID in Query)
  fastify.patch("/todos/:id", { preHandler: [fastify.authenticate] }, updateTodoHandler);

  // Ein Todo löschen
  fastify.delete("/todos/:id", { preHandler: [fastify.authenticate] }, deleteTodoHandler);

  // Todos nach Titel suchen
  fastify.get("/todos/search", { preHandler: [fastify.authenticate] }, todoSearchHandler)
}