import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export default fp(async (fastify) => {
  fastify.register(rateLimit, {
    keyGenerator: (req) => {
      const user = (req as any).user;
      return user?.id ? `user-${user.id}` : req.ip;
    },
    max: async (req) => {
      const user = (req as any).user;
      return user?.id ? 1000 : 50;
    },
    timeWindow: '1 minute',
    skipOnError: true,
  });
});
