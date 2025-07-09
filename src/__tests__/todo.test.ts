import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import jwtPlugin from "../plugins/jwt";
import { authRoutes } from "../routes/authRoutes";
import { todoRoutes } from "../routes/todosRoutes";

let app: FastifyInstance;
let authCookie: string;

beforeAll(async () => {
  // Erstelle eine separate Test-App-Instanz
  app = Fastify({
    logger: false // Deaktiviere Logs für Tests
  });

  // Registriere die gleichen Plugins wie in der Haupt-App
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
  await app.register(todoRoutes);

  // Warte bis die App bereit ist
  await app.ready();

  // Erstelle einen Testbenutzer und melde ihn an
  // Zuerst Registrierung (falls nötig)
  try {
    await app.inject({
      method: "POST",
      url: "/register",
      payload: {
        email: "test@example.com",
        password: "testpassword123",
        name: "Test User"
      }
    });
  } catch (error) {
    // Benutzer existiert möglicherweise bereits
  }

  // Dann Login
  const loginResponse = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "test@example.com",
      password: "testpassword123"
    }
  });

  // Extrahiere das Cookie korrekt
  const cookies = loginResponse.headers["set-cookie"];
  if (Array.isArray(cookies)) {
    authCookie = cookies.find(cookie => cookie.includes('authToken')) || '';
  } else {
    authCookie = cookies || '';
  }

  // Entferne die HttpOnly-Attribute für Tests
  authCookie = authCookie.split(';')[0];
});

afterAll(async () => {
  await app.close();
});

async function clearTodos() {
  // Hole alle Todos und lösche sie einzeln
  const response = await app.inject({
    method: "GET",
    url: "/todos",
    headers: { cookie: authCookie }
  });
  const todos = JSON.parse(response.payload);
  for (const todo of todos) {
    await app.inject({
      method: "DELETE",
      url: `/todos/${todo.id}`,
      headers: { cookie: authCookie }
    });
  }
}

describe("GET /todos", () => {
  it("gibt eine leere Liste zurück, wenn keine Todos existieren", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/todos",
      headers: {
        cookie: authCookie
      }
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
  afterEach(async () => {
    await clearTodos();
  });

  it("erstellt ein neues Todo", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload: { title: "Mein erstes Todo" }
    });

    expect(response.statusCode).toBe(201);
    const todo = JSON.parse(response.payload);
    expect(todo).toMatchObject({ title: "Mein erstes Todo", completed: false });
    expect(todo).toHaveProperty("id");
  });

  it("verhindert leere Titel", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      headers: { cookie: authCookie },
      payload: { title: "" }
    });

    expect(response.statusCode).toBe(400);
  });

  it("gibt 401 zurück, wenn nicht authentifiziert", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/todos",
      payload: { title: "Test" }
    });

    expect(response.statusCode).toBe(401);
  });
});
