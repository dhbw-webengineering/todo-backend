import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../prisma/client";


// GET TODOS
export async function getTodoHandler(req: FastifyRequest, reply: FastifyReply) {
  console.log(req)
  const user = req.user as { id: number };
  console.log("Fetching todos for user:", user.id);
  try {
    const todos = await prisma.todo.findMany({
      where: { userId:  user.id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Tags extrahieren
    const formattedTodos = todos.map(todo => ({
      ...todo,
      tags: todo.tags.map(t => t.tag)
    }));

    reply.send(formattedTodos);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch todos" });
  }
}

// CREATE TODO
export async function createTodoHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: number };
  const { title, dueDate, description, categoryId, tags, completedAt} = req.body as {
    title: string;
    dueDate: string;
    description?: string;
    categoryId: number;
    tags?: string[];
    completedAt?: string | null;
  };

  if (!title || !dueDate || isNaN(categoryId)) {
    return reply.status(400).send({ error: "Missing required fields" });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.userId !== user.id) {
    return reply.status(400).send({ error: "Invalid category" });
  }

  const tagConnections = tags ? await Promise.all(tags.map(async (name) => {
    const lowerName = name.toLowerCase();
    let tag = await prisma.tag.findUnique({ where: { name: lowerName } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: lowerName } });
    }
    return { tagId: tag.id };
  })) : [];

  try {
    const newTodo = await prisma.todo.create({
      data: {
        title,
        dueDate: new Date(dueDate),
        description: description ?? "",
        categoryId,
        completedAt: completedAt ? new Date(completedAt) : null,
        userId: user.id,
        tags: {
          create: tagConnections
        }
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    const formatted = {
      ...newTodo,
      tags: newTodo.tags.map(t => t.tag)
    };

    reply.status(201).send(formatted);
  } catch (error) {
    reply.status(500).send({ error: "Failed to create todo" });
  }
}

// UPDATE TODO
export async function updateTodoHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: number };
  const todoId = Number((req.params as { id?: string }).id);
  
  const {
    title,
    dueDate,
    description,
    categoryId,
    tags,
    completedAt 
  } = req.body as {
    title?: string;
    dueDate?: string;
    description?: string;
    categoryId?: number;
    tags?: string[];
    completedAt?: string | null;
  };

  const existing = await prisma.todo.findUnique({
    where: { id: todoId },
    include: { tags: true }
  });

  if (!existing || existing.userId !== user.id) {
    return reply.code(404).send({ error: "Todo not found or unauthorized" });
  }

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (dueDate !== undefined) data.dueDate = new Date(dueDate);
  if (description !== undefined) data.description = description;
  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    }); 
    if (!category || category.userId !== user.id) {
      return reply.status(400).send({ error: "Invalid category" });
    }
    data.categoryId = categoryId;
  }
  if (completedAt !== undefined) data.completedAt = completedAt; 

  try {
    await prisma.todo.update({
      where: { id: todoId },
      data,
      include: { category: true }
    });

    if (tags !== undefined) {
      // Lösche bestehende Tag-Zuordnungen
      await prisma.todoTag.deleteMany({ where: { todoId } }); 

      // Füge neue Tags hinzu (erstelle sie ggf.)
      const tagConnections = await Promise.all(tags.map(async (name) => {
        const lowerName = name.toLowerCase();
        let tag = await prisma.tag.findUnique({ where: { name: lowerName } });
        if (!tag) {
          tag = await prisma.tag.create({ data: { name: lowerName } });
        }
        return { tagId: tag.id, todoId };
      }));

      if (tagConnections.length > 0) {
        await prisma.todoTag.createMany({ data: tagConnections });
      }
    }

    // Hole das finale Todo mit allen Relationen
    const finalTodo = await prisma.todo.findUnique({
      where: { id: todoId },
      include: {
        category: true,
        tags: { include: { tag: true } }
      }
    });

    if (!finalTodo) {
      return reply.code(404).send({ error: "Todo not found after update" });
    }

    // Formatierung: tags als Array von {id, name}
    const formatted = {
      ...finalTodo,
      tags: finalTodo.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name
      }))
    };
    reply.send(formatted);
  } catch (error) {
    reply.code(500).send({ error: "Failed to update todo" });
  }
}
// DELETE TODO
export async function deleteTodoHandler(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: number };
  const todoId = Number((req.params as { id?: string }).id);

  const existing = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!existing || existing.userId !== user.id) {
    return reply.code(404).send({ error: "Todo not found or unauthorized" });
  }

  try {
    await prisma.todoTag.deleteMany({where: { todoId: todoId } });
    await prisma.todo.delete({ where: { id: todoId } });
    reply.code(204).send();
  } catch (error) {
    reply.code(500).send({ error: "Failed to delete todo" });
  }
}