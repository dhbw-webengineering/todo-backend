import Fastify from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/authRoutes";
import { passwordResetRoutes } from "./routes/passwordResetRoutes";
import { todoRoutes } from "./routes/todosRoutes";
import jwtPlugin from "./plugins/jwt";
import rateLimit from "./plugins/rateLimit";
import userRoutes from "./routes/userRoutes";

const app = Fastify();

app.register(cors, {
  origin: true, // <-- erlaubt alle Origins
  credentials: true, // falls du Cookies/Credentials brauchst
});

app.register(rateLimit);
app.register(jwtPlugin);
app.register(authRoutes);
app.register(passwordResetRoutes);
app.register(todoRoutes);
app.register(userRoutes)

app.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});