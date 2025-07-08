import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyRequest, FastifyReply } from "fastify";
import { e } from "../config/env";

export default fp(async function (fastify) {
    fastify.register(jwt, {
        secret: e.JWT_SECRET,
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
            console.log("JWT verification successful, user:", request.user);
        } catch (err) {
            console.error("JWT Verify Error:", err);
            reply.code(401).send({ error: "Unauthorized" });
        }
    });
});
