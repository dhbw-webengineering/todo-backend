import { randomBytes } from "crypto";
import prisma from "../prisma/client";

export async function generateResetToken(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.passwordResetToken.create({
    data: { token, userId, expiresAt: expires },
  });
  return token;
}

export async function validateResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) return null;
  return record;
}

export async function consumeResetToken(token: string) {
  await prisma.passwordResetToken.delete({ where: { token } });
}