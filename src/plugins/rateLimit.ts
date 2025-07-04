import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export default fp(async (fastify) => {
  fastify.register(rateLimit, {
    max: 50, 
    timeWindow: '1 minute',
    keyGenerator: (req) => {
      const user = (req as any).user;
      return user?.id ? `user-${user.id}` : req.ip;
    },
    allowList: () => {
      return false;
    },
    skipOnError: true, 
  });
});
