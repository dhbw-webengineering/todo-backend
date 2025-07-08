import { FastifyRequest, FastifyReply } from "fastify";

import argon2 from "argon2";
import prisma from "../prisma/client";
import emailService from "../services/emailService";
import { e } from "../config/env";

export async function registerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as { email: string; password: string };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
    return reply.code(400).send({ error: "Invalid input.", message: "Bitte gib eine gültige E-Mail-Adresse und ein Passwort mit mindestens 6 Zeichen ein." });
  }

  try {
    const hashed = await argon2.hash(password);
    const user = await prisma.user.create({ data: { email, password: hashed } });
    sendWelcomeMail({ to: user.email });
    reply.code(201).send({ id: user.id, email: user.email });
  } catch {
    reply.code(400).send({ error: "User already exists or invalid data.", message: "Diese Email ist bereits registriert" });
  }
}

async function sendWelcomeMail({ to }: { to: string }) {
  const subject = "Registrierung erfolgreich";
  const body = `
    <h1>Registrierung erfolgreich</h1>
    <p>Hallo,</p>
    <p>Diese E-Mail-Adresse wurde erfolgreich für <a href="example.com">example.com</a> registriert.</p>
  `;
  await emailService.sendMail({ to, subject, body });
}

export async function loginHandler(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await argon2.verify(user.password, password))) {
    return reply.code(401).send({ error: "Invalid credentials", message: "Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten." });
  }

  const token = await reply.jwtSign({ id: user.id, email: user.email });

  reply.setCookie("authToken", token, {
    path: "/",
    httpOnly: true,
    secure: e.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,            // 24 Stunden (in Sekunden)
    signed: false,
  });

  reply.send({ message: "Login successful", token: token, user: { id: user.id, email: user.email } });
}

export async function logoutHandler(req: FastifyRequest, reply: FastifyReply) {
  console.log("Logout request received");
  console.log("Request user:", req.user);

  reply.clearCookie('authToken', {
    path: '/',
    httpOnly: true,
    secure: e.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Cookie sofort löschen
  });

  reply.send({ message: 'Logout successful' });
}

export async function meHandler(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found." });
    }

    reply.send(user);
  } catch (err) {
    reply.code(500).send({ error: "Failed to retrieve user." });
  }
}