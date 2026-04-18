/**
 * Ambient type declarations for the Postiz Prisma client.
 *
 * The actual module is generated at `node_modules/postiz-prisma-client` by running:
 *   npx prisma generate --schema=src/postiz-db/schema.prisma
 *
 * This declaration file lets TypeScript compile without errors even before
 * the client has been generated (e.g. on a fresh checkout / CI).
 */
declare module "postiz-prisma-client" {
  export class PrismaClient {
    constructor(options?: { datasourceUrl?: string });
    $transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T>;
    $disconnect(): Promise<void>;
    user: UserDelegate;
    organization: OrganizationDelegate;
    userOrganization: UserOrganizationDelegate;
    subscription: SubscriptionDelegate;
  }

  // Minimal delegate interfaces covering the methods we actually call.
  interface UserDelegate {
    create(args: { data: Record<string, unknown> }): Promise<Record<string, unknown>>;
    findUnique(args: {
      where: Record<string, unknown>;
      include?: Record<string, unknown>;
    }): Promise<Record<string, unknown> | null>;
    delete(args: { where: Record<string, unknown> }): Promise<Record<string, unknown>>;
  }

  interface OrganizationDelegate {
    create(args: { data: Record<string, unknown> }): Promise<Record<string, unknown>>;
    delete(args: { where: Record<string, unknown> }): Promise<Record<string, unknown>>;
  }

  interface UserOrganizationDelegate {
    create(args: { data: Record<string, unknown> }): Promise<Record<string, unknown>>;
  }

  interface SubscriptionDelegate {
    upsert(args: {
      where: Record<string, unknown>;
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    }): Promise<Record<string, unknown>>;
    update(args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }): Promise<Record<string, unknown>>;
  }

  /** Subset of PrismaClient available inside $transaction callbacks. */
  interface TransactionClient {
    user: UserDelegate;
    organization: OrganizationDelegate;
    userOrganization: UserOrganizationDelegate;
    subscription: SubscriptionDelegate;
  }

  export type SubscriptionTier = "STANDARD" | "PRO" | "ULTIMATE";
  export type SubscriptionPeriod = "MONTHLY" | "YEARLY" | "LIFETIME";
}
