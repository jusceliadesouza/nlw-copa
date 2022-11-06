import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";

import ShortUniqueId from "short-unique-id";
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
  // Contagem de bolões
  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();
    return { count };
  });

  // Criação de bolão com usuário logado
  fastify.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    // todo: fazer o tratamento de erro para criações nulas

    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    try {
      await request.jwtVerify();

      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch (error) {
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      });
    }

    return reply.status(201).send({ code });
  });

  // Entrada no bolão
  fastify.post(
    "/pools/join",
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const joinPoolBody = z.object({
        code: z.string(),
      });
      const { code } = joinPoolBody.parse(request.body);

      const pool = await prisma.pool.findUnique({
        where: {
          code,
        },
        include: {
          participants: {
            where: {
              userId: request.user.sub,
            },
          },
        },
      });

      if (!pool) {
        return reply.status(400).send({
          message: "Pool not found!",
        });
      }

      // Condição para bolão sem dono
      if (pool.participants.length > 0) {
        return reply.status(400).send({
          message: "You already joined this pool!",
        });
      }

      if (!pool.ownerId) {
        await prisma.pool.update({
          where: {
            id: pool.id,
          },
          data: {
            ownerId: request.user.sub,
          },
        });
      }

      await prisma.participant.create({
        data: {
          poolId: pool.id,
          userId: request.user.sub,
        },
      });

      return reply.status(201).send();
    }
  );

  // Relação de Bolões que o usuário participa
  fastify.get(
    "/pools",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const pools = await prisma.pool.findMany({
        where: {
          participants: {
            some: { userId: request.user.sub },
          },
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
          participants: {
            select: {
              id: true,

              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { pools };
    }
  );

  // Detalhes de um bolão

  fastify.get(
    "/pools/:id",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const getPoolsParams = z.object({
        id: z.string(),
      });

      const { id } = getPoolsParams.parse(request.params);

      const pool = await prisma.pool.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
          participants: {
            select: {
              id: true,

              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { pool };
    }
  );

  //  TODO
  // Listagem de jogos de um bolão

  // Criação de um palpite
}
