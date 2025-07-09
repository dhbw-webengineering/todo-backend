import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import jwtPlugin from "../plugins/jwt";
import { authRoutes } from "../routes/authRoutes";
import { todoRoutes } from "../routes/todosRoutes";
import { categoryRoutes } from "../routes/categoryTagsRoutes";

// Hilfsfunktionen für wiederkehrende Abläufe
async function registerAndLogin(app: FastifyInstance, email: string, password: string, name = "Test User") {
  try {
    await app.inject({
      method: "POST",
      url: "/register",
      payload: { email, password, name }
    });
  } catch {}
  const loginResponse = await app.inject({
    method: "POST",
    url: "/login",
    payload: { email, password }
  });
  const cookies = loginResponse.headers["set-cookie"];
  let cookie = "";
  if (Array.isArray(cookies)) {
    cookie = cookies.find(c => c.includes("authToken")) || "";
  } else {
    cookie = cookies || "";
  }
  return cookie.split(";")[0];
}

async function createCategory(app: FastifyInstance, cookie: string, name = "Testkategorie", color = "#abcdef") {
  const res = await app.inject({
    method: "POST",
    url: "/category",
    headers: { cookie },
    payload: { name, color }
  });
  return JSON.parse(res.payload);
}

async function clearTodos(app: FastifyInstance, cookie: string) {
  const response = await app.inject({
    method: "GET",
    url: "/todos",
    headers: { cookie }
  });
  const todos = JSON.parse(response.payload);
  for (const todo of todos) {
    await app.inject({
      method: "DELETE",
      url: `/todos/${todo.id}`,
      headers: { cookie }
    });
  }
}

let app: FastifyInstance;
let authCookie: string;
let testCategoryId: number;

// Test-Setup
beforeAll(async () => {
  app = Fastify({ logger: false });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  });
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET!,
  });
  await app.register(jwtPlugin);
  await app.register(authRoutes);
  await app.register(categoryRoutes);
  await app.register(todoRoutes);

  await app.ready();

  authCookie = await registerAndLogin(app, "test@example.com", "testpassword123");
  const category = await createCategory(app, authCookie);
  testCategoryId = category.id;
});

afterAll(async () => {
  await app.close();
});

afterEach(async () => {
  await clearTodos(app, authCookie);
});


describe("GET /todos", () => {
  it("gibt eine leere Liste zurück, wenn keine Todos existieren", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/todos",
      headers: { cookie: authCookie }
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual([]);
  });

  it("gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/todos"
    });
    expect(response.statusCode).toBe(401);
  });
});

describe("POST /todos", () => {
  it("erstellt ein neues Todo", async () => {
    const payload = {
      title: "Mein erstes Todo",
      dueDate: new Date().toISOString(),
      categoryId: testCategoryId
    };
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload
    });
    expect(response.statusCode).toBe(201);
    const todo = JSON.parse(response.payload);
    expect(todo).toHaveProperty("id");
    expect(todo).toHaveProperty("title", payload.title);
    expect(todo).toHaveProperty("categoryId", testCategoryId);
    if ("completed" in todo) {
      expect(todo.completed).toBe(false);
    }
  });

  it("verhindert leere Titel", async () => {
    const payload = {
      title: "",
      dueDate: new Date().toISOString(),
      categoryId: testCategoryId
    };
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload
    });
    expect(response.statusCode).toBe(400);
  });

  it("gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const payload = {
      title: "Test",
      dueDate: new Date().toISOString(),
      categoryId: testCategoryId
    };
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      payload
    });
    expect(response.statusCode).toBe(401);
  });
});

describe("PATCH /todos/:id", () => {
  let todoId: number;

  beforeEach(async () => {
    const payload = {
      title: "Zu aktualisieren",
      dueDate: new Date().toISOString(),
      categoryId: testCategoryId
    };
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload
    });
    todoId = JSON.parse(response.payload).id;
  });

  it("aktualisiert ein bestehendes Todo", async () => {
    const updatePayload = { title: "Aktualisiert", completed: true };
    const response = await app.inject({
      method: "PATCH",
      url: `/todos/${todoId}`,
      headers: { cookie: authCookie },
      payload: updatePayload
    });
    expect(response.statusCode).toBe(200);
    const updated = JSON.parse(response.payload);
    expect(updated).toHaveProperty("title", "Aktualisiert");
    if ("completed" in updated) {
      expect(updated.completed).toBe(true);
    }
  });

  it("gibt 404 zurück bei ungültiger ID", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/todos/9999999`,
      headers: { cookie: authCookie },
      payload: { title: "Test" }
    });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /todos/:id", () => {
  let todoId: number;

  beforeEach(async () => {
    const payload = {
      title: "Zu löschen",
      dueDate: new Date().toISOString(),
      categoryId: testCategoryId
    };
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload
    });
    todoId = JSON.parse(response.payload).id;
  });

  it("löscht ein bestehendes Todo", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/todos/${todoId}`,
      headers: { cookie: authCookie }
    });
    expect(response.statusCode).toBe(204);

    const getResponse = await app.inject({
      method: "GET",
      url: "/todos",
      headers: { cookie: authCookie }
    });
    const todos = JSON.parse(getResponse.payload);
    expect(todos.find((t: any) => t.id === todoId)).toBeUndefined();
  });

  it("gibt 404 zurück bei ungültiger ID", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/todos/9999999`,
      headers: { cookie: authCookie }
    });
    expect(response.statusCode).toBe(404);
  });
});

describe("Berechtigungen", () => {
  it("ein Benutzer kann nicht die Todos eines anderen Benutzers löschen", async () => {
    const todoResponse = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload: {
        title: "Fremdes Todo",
        dueDate: new Date().toISOString(),
        categoryId: testCategoryId
      }
    });
    const todoId = JSON.parse(todoResponse.payload).id;

    const otherCookie = await registerAndLogin(app, "other@example.com", "otherpassword", "Other User");

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/todos/${todoId}`,
      headers: { cookie: otherCookie }
    });
    expect(deleteResponse.statusCode).toBe(404);

    await clearTodos(app, otherCookie);
  });
});