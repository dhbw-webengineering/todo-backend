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

export async function getTagsHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: number };

  try {
    // 1. Hole alle Todos des Users inkl. ihrer Tags
    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    // 2. Extrahiere alle Tag-Objekte aus allen Todos
    const allTags = todos.flatMap(todo => todo.tags.map(t => t.tag));

    // 3. Mache die Tags unique (nach id)
    const uniqueTagsMap = new Map<number, { id: number; name: string }>();
    allTags.forEach(tag => {
      uniqueTagsMap.set(tag.id, { id: tag.id, name: tag.name });
    });
    const uniqueTags = Array.from(uniqueTagsMap.values());

    reply.send(uniqueTags);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch tags" });
  }
}
