import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { postizPrisma } from "./postiz-db";

function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createPostizUser(email: string, password: string, companyName: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const apiKey = generateApiKey();

  return postizPrisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: { email, password: hashedPassword, providerName: "LOCAL", activated: true, timezone: 0 },
    });
    const organization = await tx.organization.create({
      data: { name: companyName, apiKey, allowTrial: true, isTrailing: true },
    });
    await tx.userOrganization.create({
      data: { userId: user.id, organizationId: organization.id, role: "SUPERADMIN" },
    });
    return { user, organization };
  });
}

export async function deletePostizUser(email: string) {
  const prisma = postizPrisma as any;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organizationUsers: true },
  });
  if (!user) return;
  await prisma.$transaction(async (tx: any) => {
    for (const m of user.organizationUsers) {
      await tx.organization.delete({ where: { id: m.organizationId } });
    }
    await tx.user.delete({ where: { id: user.id } });
  });
}

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
  tier: "STANDARD" | "PRO" | "ULTIMATE";
  period: "MONTHLY" | "YEARLY" | "LIFETIME";
  totalChannels: number;
  postsPerMonth: number;
  cancelAt?: Date | null;
  identifier?: string;
}) {
  const prisma = postizPrisma as any;
  const postizUser = await prisma.user.findUnique({
    where: { email },
    include: { organizationUsers: { include: { organization: true }, take: 1 } },
  });
  if (!postizUser || postizUser.organizationUsers.length === 0) {
    console.warn(`[postiz-sync] No user/org for email: ${email}`);
    return null;
  }
  const organizationId = postizUser.organizationUsers[0].organizationId;
  return prisma.subscription.upsert({
    where: { organizationId },
    create: { organizationId, subscriptionTier: tier, period, totalChannels, postsPerMonth, cancelAt: cancelAt ?? null, identifier: identifier ?? null },
    update: { subscriptionTier: tier, period, totalChannels, postsPerMonth, cancelAt: cancelAt ?? null, deletedAt: null, ...(identifier ? { identifier } : {}) },
  });
}

export async function softDeletePostizSubscription(email: string) {
  const prisma = postizPrisma as any;
  const postizUser = await prisma.user.findUnique({
    where: { email },
    include: { organizationUsers: { take: 1 } },
  });
  if (!postizUser || postizUser.organizationUsers.length === 0) {
    console.warn(`[postiz-sync] No user/org for email: ${email}`);
    return null;
  }
  const organizationId = postizUser.organizationUsers[0].organizationId;
  return prisma.subscription.update({ where: { organizationId }, data: { deletedAt: new Date() } });
}
