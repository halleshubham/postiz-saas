import { PrismaClient } from ".prisma/postiz-client";

declare global {
  // eslint-disable-next-line no-var
  var _postizPrisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
  if (!global._postizPrisma) {
    global._postizPrisma = new PrismaClient({
      datasources: { db: { url: process.env.POSTIZ_DATABASE_URL } },
    });
  }
  return global._postizPrisma;
}

export const postizPrisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return (getClient() as any)[prop];
  },
});
