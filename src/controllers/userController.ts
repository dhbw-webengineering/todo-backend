import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../prisma/client";
import argon2 from "argon2";

interface UpdateUserBody {
  email?: string;
  password?: string;
}

export async function updateUserHandler(req: FastifyRequest, reply: FastifyReply) {
  const userId = (req.user as { id: number }).id;
  const { email, password } = req.body as UpdateUserBody;

  if (!email && !password) {
    return reply.code(400).send({ error: "Nothing to update." });
  }

  const updateData: { email?: string; password?: string } = {};

  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.code(400).send({ error: "Invalid email." });
    }
    updateData.email = email;
  }

  if (password) {
    if (password.length < 6) {
      return reply.code(400).send({ error: "Password too short." });
    }
    updateData.password = await argon2.hash(password);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true },
    });
    reply.send({ message: "User updated", user: updatedUser });
  } catch (err) {
    reply.code(500).send({ error: "Failed to update user." });
  }
}
