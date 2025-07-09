import { describe, it, expect, beforeAll } from "vitest";
import app from "../app"; // Default-Export aus app.ts
// Falls du eine Funktion exportierst, dann: import { buildApp } from "../app";

let authCookie: string;

beforeAll(async () => {
  // Testnutzer anlegen (optional, falls nicht vorhanden)
  // await app.inject({ ... });

  // Login simulieren
  const loginResponse = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "simon@knoep.de",    // Passe die Testdaten ggf. an
      password: "justin12"
    }
  });

  // Cookie aus dem Login extrahieren
  authCookie = String(loginResponse.headers["set-cookie"]);
});

describe("GET /todos", () => {
  it("gibt eine leere Liste zurück, wenn keine Todos existieren", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/todos",
      headers: {
        cookie: authCookie // Authentifizierung via Cookie
      }
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual([]);
  });
});
