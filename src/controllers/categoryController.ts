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

export async function createCategoryHandler(req: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) {
  const user = req.user as { id: number };
  const { name } = req.body;

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        userId: user.id
      }
    });
    reply.status(201).send(newCategory);
  } catch (error) {
    reply.status(500).send({ error: "Failed to create category" });
  }
}

export async function updateCategoryHandler(req: FastifyRequest<{ Params: { id: string }, Body: { name: string } }>, reply: FastifyReply) {
  const user = req.user as { id: number };
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) }
    });

    if (!category || category.userId !== user.id) {
      return reply.status(404).send({ error: "Category not found" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    });
    reply.send(updatedCategory);
  } catch (error) {
    reply.status(500).send({ error: "Failed to update category" });
  }
}

export async function deleteCategoryHandler(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const user = req.user as { id: number };
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) }
    });

    if (!category || category.userId !== user.id) {
      return reply.status(404).send({ error: "Category not found" });
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    });

    reply.status(204).send();
  } catch (error) {
    reply.status(500).send({ error: "Failed to delete category" });
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