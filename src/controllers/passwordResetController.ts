import { FastifyRequest, FastifyReply } from "fastify";
import { generateResetToken, validateResetToken, consumeResetToken } from "../services/tokenService";
import prisma from "../prisma/client";
import argon2 from "argon2";
import emailService from "../services/emailService";
import { e } from "../config/env";

export async function requestPasswordResetHandler(req: FastifyRequest, reply: FastifyReply) {
  const { email } = req.body as { email: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await generateResetToken(user.id);
    const link = `${e.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, link);
  }
  reply.send({ message: "Wenn die E-Mail existiert, wurde ein Reset-Link versendet." });
}

async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = "Passwort zurücksetzen";
  const body = `
    <h1>Passwort zurücksetzen</h1>
    <p>Hallo,</p>
    <p>Bitte klicke auf den folgenden Link, um dein Passwort zurückzusetzen:<br><a href="${resetLink}">${resetLink}</a></p>
    <p>Der Link ist 30 Minuten gültig.<br>
    Wenn du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>
  `;
  await emailService.sendMail({ to, subject, body });
}

export async function resetPasswordHandler(req: FastifyRequest, reply: FastifyReply) {
  const { token, newPassword } = req.body as { token: string; newPassword: string };
  const valid = await validateResetToken(token);

  if (!valid) return reply.status(400).send({ error: "Ungültiger oder abgelaufener Token." });

  const hashedPassword = await argon2.hash(newPassword);
  await prisma.user.update({ where: { id: valid.userId }, data: { password: hashedPassword } });
  await consumeResetToken(token);

  reply.send({ message: "Passwort erfolgreich zurückgesetzt." });
}

export async function verifyResetTokenHandler(req: FastifyRequest, reply: FastifyReply) {
  const { token } = req.query as { token: string };
  const valid = await validateResetToken(token);
  if (!valid) return reply.status(400).send({ error: "Ungültiger oder abgelaufener Token." });

  reply.send({ message: "Token ist gültig." });
}
