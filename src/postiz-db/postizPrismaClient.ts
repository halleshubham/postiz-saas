import { PrismaClient } from "postiz-prisma-client";

let postizPrisma: PrismaClient | undefined;

export function getPostizPrisma(): PrismaClient {
  if (!postizPrisma) {
    postizPrisma = new PrismaClient({
      datasourceUrl: process.env.POSTIZ_DATABASE_URL,
    });
  }
  return postizPrisma;
}
