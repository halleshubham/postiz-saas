import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
  if (!global._prisma) {
    global._prisma = new PrismaClient();
  }
  return global._prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return (getClient() as any)[prop];
  },
});
