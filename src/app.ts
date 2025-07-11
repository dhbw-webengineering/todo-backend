import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";

import { authRoutes } from "./routes/authRoutes";
import { passwordResetRoutes } from "./routes/passwordResetRoutes";
import { todoRoutes } from "./routes/todosRoutes";
import jwtPlugin from "./plugins/jwt";
// import rateLimit from "./plugins/rateLimit";
import userRoutes from "./routes/userRoutes";
import { categoryRoutes } from "./routes/categoryTagsRoutes";
import { e } from "./config/env";

const app = Fastify();

app.register(cors, {
  origin: e.NODE_ENV == "development" ? true : e.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});

// app.register(rateLimit);

app.register(fastifyCookie, {
  secret: e.COOKIE_SECRET,
});

app.register(jwtPlugin);
app.register(authRoutes);
app.register(passwordResetRoutes);
app.register(todoRoutes);
app.register(userRoutes);
app.register(categoryRoutes);

app.listen({ port: e.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});

export default app;
