import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyRequest, FastifyReply } from "fastify";

export default fp(async function (fastify) {
    fastify.register(jwt, {
        secret: "your-super-secret-key",
        cookie: {
            cookieName: "authToken",
            signed: false
        }
    });

    fastify.decorate("authenticate", async function (
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            await request.jwtVerify();
        } catch {
            reply.code(401).send({ error: "Unauthorized" });
        }
    });
});
