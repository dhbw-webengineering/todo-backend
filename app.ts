import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import moment from 'moment'



interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: number;
    tags: string[];
    done: boolean;
}
interface Category {
    name: string;
    id: number;
    user_id: number;
}

const app: FastifyInstance = Fastify();
const tasks: Task[] = [{
    id: 0,
    title: "Test0",
    description: "string",
    dueDate: 1746205163,
    tags: ["tag1", "tag2"],
    done: false
}, {
    id: 1,
    title: "Test1",
    description: "description description description description description description description description description description description description description ",
    dueDate: 1746305163,
    tags: [],
    done: true
}, {
    id: 2,
    title: "Test2",
    description: "string",
    dueDate: 1743301163,
    tags: ["tag1"],
    done: false
}];
const categories: Category[] = [{
    name: "Standard",
    id: 0,
    user_id: 0
}, {
    name: "Studium",
    id: 1,
    user_id: 0
}, {
    name: "Einkaufen",
    id: 2,
    user_id: 0
}];

// Tags von String, in dem sie durch ","," " oder ";" getrennt werden mit dem regex in ein Array parsen und randleerzeichen entfernen
const parseTags = (tags: string | string[]): string[] => {
    if (typeof tags === 'string') {
        return tags.split(/[\s,;]+/).map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
};

app.register(cors, {
    origin: ['http://localhost:3000', 'https://dhbw-webengineering.github.io'], // Exakte Origin, keine Wildcards
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: true, // Wenn der preflight-Mechanismus explizit aktiviert werden muss
});

app.get('/test', (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ message: 'CORS funktioniert!' });
});

// task erstellen
app.post('/api/entry/create', (request: FastifyRequest, reply: FastifyReply) => {
    const { title, description = '', dueDate, tags = '' } = request.body as {
        title: string;
        description?: string;
        dueDate: string;
        tags?: string | string[];
    };
    if (!title || !dueDate) {
        return reply.status(400).send({ error: 'Title and dueDate are required' });
    }

    const timestamp = moment(dueDate, moment.ISO_8601, true).unix();
    if (!moment(dueDate, moment.ISO_8601, true).isValid()) {
        return reply.status(400).send({ error: 'Invalid date. provide iso 8601' });
    }

    const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 0;

    const newTask: Task = {
        id: newId,
        title,
        description,
        dueDate: timestamp,
        tags: parseTags(tags),
        done: false,
    };
    tasks.push(newTask);
    reply.status(201).send(newTask);
});

// status setzen
app.patch('/api/entry/:id/set', (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { done } = request.body as { done: boolean };
    const task = tasks.find(t => t.id === parseInt(id));
    if (!task) return reply.status(404).send({ error: 'Task not found' });

    task.done = done === true;
    reply.send(task);
});

// task editieren
app.put('/api/entry/:id/edit', (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const task = tasks.find(t => t.id === parseInt(id));
    if (!task) return reply.status(404).send({ error: 'Task not found' });

    const { title, description, dueDate, tags } = request.body as Partial<Task>;
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) {
        const timestamp = moment(dueDate, moment.ISO_8601, true).unix();
        if (!moment(dueDate, moment.ISO_8601, true).isValid()) {
            return reply.status(400).send({ error: 'Invalid date!' });
        }
        task.dueDate = timestamp;
    }
    if (tags) task.tags = parseTags(tags);

    reply.send(task);
});

// task löschen
app.delete('/api/entry/:id/delete', (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const index = tasks.findIndex(t => t.id === parseInt(id));
    if (index === -1) return reply.status(404).send({ error: 'Task not found' });

    tasks.splice(index, 1);
    reply.status(204).send();
});

// alle tasks zurückgeben
app.get('/api/entry/list', (request: FastifyRequest, reply: FastifyReply) => {
    reply.send(tasks);
});

// task anhand der id zurückgeben
app.get('/api/entry/:id', (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const task = tasks.find(t => t.id === parseInt(id));
    if (!task) return reply.status(404).send({ error: 'Task not found' });
    reply.send(task);
});






// category erstellen
app.post('/api/category/create', (request: FastifyRequest, reply: FastifyReply) => {
    const { name, user_id } = request.body as {
        name: string,
        user_id: number
    };
    if (!name || !user_id ) {
        return reply.status(400).send({ error: 'Name and User Id are required' });
    }

    const newId = categories.length > 0 ? categories[categories.length - 1].id + 1 : 0;

    const newCategory: Category = {
        name: name,
        id: newId,
        user_id: user_id
    };
    categories.push(newCategory);
    reply.status(201).send(newCategory);
});

// category editieren
app.put('/api/category/:id/edit', (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const category = categories.find(c => c.id === parseInt(id));
    if (!category) return reply.status(404).send({ error: 'Category not found' });

    const { name } = request.body as Partial<Category>;
    if (name) category.name = name;

    reply.send(category);
});

// category löschen
app.delete('/api/category/:id/delete', (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const index = categories.findIndex(c => c.id === parseInt(id));
    if (index === -1) return reply.status(404).send({ error: 'Category not found' });

    categories.splice(index, 1);
    reply.status(204).send();
});

// alle categories zurückgeben
app.get('/api/category/list', (request: FastifyRequest, reply: FastifyReply) => {
    reply.send(categories);
});



app.listen({ port: 3001 }, () => {
    console.log('Server running on port 3001');
});
