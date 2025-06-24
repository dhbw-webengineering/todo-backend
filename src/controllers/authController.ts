import { FastifyRequest, FastifyReply } from "fastify";

import argon2 from "argon2";
import prisma from "../prisma/client";
import emailService from "../services/emailService";

export async function registerHandler(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as { email: string; password: string };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
    return reply.code(400).send({ error: "Invalid input." });
  }

  try {
    const hashed = await argon2.hash(password);
    const user = await prisma.user.create({ data: { email, password: hashed } });
    sendWelcomeMail({ to: user.email });
    reply.code(201).send({ id: user.id, email: user.email });
  } catch {
    reply.code(400).send({ error: "User already exists or invalid data." });
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
    return reply.code(401).send({ error: "Invalid credentials" });
  }

  const token = await reply.jwtSign({ id: user.id, email: user.email });

  // Token als HttpOnly-Cookie setzen
  reply.setCookie("authToken", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,            // 24 Stunden (in Sekunden)
    signed: false,
  });

  reply.send({ message: "Login successful" });
}

export async function logoutHandler(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie('authToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  reply.send({ message: 'Logout successful' });
}
