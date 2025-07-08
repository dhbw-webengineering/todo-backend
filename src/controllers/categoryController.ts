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

export async function createCategoryHandler(
  req: FastifyRequest<{ Body: { name: string } }>,
  reply: FastifyReply
) {
  const user = req.user as { id: number };
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return reply.status(400).send({ error: "Ungültiger Kategoriename" });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        userId: user.id,
      },
    });
    reply.status(201).send(newCategory);
  } catch (error) {
    console.error("createCategoryHandler error:", error);
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

export async function deleteCategoryHandler(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = req.user as { id: number };
  const { id } = req.params;
  const categoryId = Number(id);

  try {
    // Hole die Kategorie und prüfe Existenz und Besitz
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== user.id) {
      return reply.status(404).send({ error: "Kategorie nicht gefunden" });
    }

    // Zähle alle Kategorien des Nutzers
    const categoryCount = await prisma.category.count({
      where: { userId: user.id },
    });

    if (categoryCount <= 1) {
      return reply.status(400).send({ error: "Letzte Kategorie kann nicht gelöscht werden" });
    }

    // Lösche alle Tasks mit dieser Kategorie
    await prisma.todo.deleteMany({
      where: {
        userId: user.id,
        categoryId: categoryId,
      },
    });

    // Lösche die Kategorie selbst
    await prisma.category.delete({
      where: { id: categoryId },
    });

    reply.status(204).send();
  } catch (error) {
    console.error("Fehler beim Löschen der Kategorie:", error);
    reply.status(500).send({ error: "Fehler beim Löschen der Kategorie" });
  }
}


export async function getTagsHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: number };

  try {
    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    const allTags = todos.flatMap(todo => todo.tags.map(t => t.tag));

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