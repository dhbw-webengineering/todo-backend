import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";

import { authRoutes } from "./routes/authRoutes";
import { passwordResetRoutes } from "./routes/passwordResetRoutes";
import { todoRoutes } from "./routes/todosRoutes";
import jwtPlugin from "./plugins/jwt";
import rateLimit from "./plugins/rateLimit";
import userRoutes from "./routes/userRoutes";
import { categoryRoutes } from "./routes/categoryTagsRoutes";

const app = Fastify();

app.register(cors, {
  origin: true, // erlaubt alle Origins
  credentials: true, // falls Cookies/Credentials benötigt werden
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // explizit alle Methoden erlauben
});

// app.register(rateLimit);

app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET,
});
app.register(jwtPlugin);
app.register(authRoutes);
app.register(passwordResetRoutes);
app.register(todoRoutes);
app.register(userRoutes);
app.register(categoryRoutes);

app.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});
