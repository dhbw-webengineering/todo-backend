import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../prisma/client";


export async function getCategoryHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: number };

  try {
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });

    reply.send(categories);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch categories" });
  }
}