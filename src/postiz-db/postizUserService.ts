import crypto from "node:crypto";
import { getPostizPrisma } from "./postizPrismaClient";
import type { SubscriptionTier, SubscriptionPeriod } from "postiz-prisma-client";

// We lazily import bcrypt so the module can be loaded even when the
// dependency hasn't been installed yet (type-check time, etc.).
async function hashPassword(plain: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(plain, 10);
}

function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a user + organization + membership in the Postiz database.
 * Uses a transaction so everything succeeds or fails together.
 */
export async function createPostizUser(
  email: string,
  password: string,
  companyName: string,
) {
  const prisma = getPostizPrisma();
  const hashedPassword = await hashPassword(password);
  const apiKey = generateApiKey();

  return prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        providerName: "LOCAL",
        activated: true,
        timezone: 0,
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: companyName,
        apiKey,
        allowTrial: true,
        isTrailing: true,
      },
    });

    await tx.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "SUPERADMIN",
      },
    });

    return { user, organization };
  });
}

/**
 * Delete a user and their organization from the Postiz database.
 */
export async function deletePostizUser(email: string) {
  const prisma = getPostizPrisma() as any;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organizationUsers: true },
  });

  if (!user) return;

  await prisma.$transaction(async (tx: any) => {
    for (const membership of user.organizationUsers) {
      await tx.organization.delete({
        where: { id: membership.organizationId },
      });
    }
    await tx.user.delete({ where: { id: user.id } });
  });
}

/**
 * Create or update a Subscription row in the Postiz database tied to an organization.
 */
export async function updatePostizSubscription({
  email,
  tier,
  period,
  totalChannels,
  postsPerMonth,
  cancelAt,
  identifier,
}: {
  email: string;
  tier: SubscriptionTier;
  period: SubscriptionPeriod;
  totalChannels: number;
  postsPerMonth: number;
  cancelAt?: Date | null;
  identifier?: string;
}) {
  const prisma = getPostizPrisma() as any;

  const postizUser = await prisma.user.findUnique({
    where: { email },
    include: {
      organizationUsers: {
        include: { organization: true },
        take: 1,
      },
    },
  });

  if (!postizUser || postizUser.organizationUsers.length === 0) {
    console.warn(`[postiz-sync] No Postiz user/org found for email: ${email}`);
    return null;
  }

  const organizationId = postizUser.organizationUsers[0].organizationId;

  return prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      subscriptionTier: tier,
      period,
      totalChannels,
      postsPerMonth,
      cancelAt: cancelAt ?? null,
      identifier: identifier ?? null,
    },
    update: {
      subscriptionTier: tier,
      period,
      totalChannels,
      postsPerMonth,
      cancelAt: cancelAt ?? null,
      deletedAt: null,
      ...(identifier ? { identifier } : {}),
    },
  });
}

/**
 * Soft-delete a Postiz subscription (set deletedAt).
 */
export async function softDeletePostizSubscription(email: string) {
  const prisma = getPostizPrisma() as any;

  const postizUser = await prisma.user.findUnique({
    where: { email },
    include: {
      organizationUsers: { take: 1 },
    },
  });

  if (!postizUser || postizUser.organizationUsers.length === 0) {
    console.warn(`[postiz-sync] No Postiz user/org found for email: ${email}`);
    return null;
  }

  const organizationId = postizUser.organizationUsers[0].organizationId;

  return prisma.subscription.update({
    where: { organizationId },
    data: { deletedAt: new Date() },
  });
}
