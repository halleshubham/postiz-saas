import { prisma } from "./db";
import { PaymentPlanId, SubscriptionStatus } from "./plans";
import { updatePostizSubscription, softDeletePostizSubscription } from "./postiz-user-service";

const POSTIZ_TIER_MAP: Record<string, { tier: "STANDARD" | "PRO"; totalChannels: number; postsPerMonth: number }> = {
  starter: { tier: "STANDARD", totalChannels: 5, postsPerMonth: 400 },
  growth: { tier: "PRO", totalChannels: 30, postsPerMonth: 1_000_000 },
};

export async function fetchUserByProcessorId(paymentProcessorUserId: string) {
  return prisma.user.findUnique({ where: { paymentProcessorUserId } });
}

export async function updateUserPaymentProcessorUserId(userId: string, paymentProcessorUserId: string) {
  return prisma.user.update({ where: { id: userId }, data: { paymentProcessorUserId } });
}

export async function updateUserSubscription({
  paymentProcessorUserId,
  paymentPlanId,
  subscriptionStatus,
  datePaid,
}: {
  paymentProcessorUserId: string;
  subscriptionStatus: SubscriptionStatus;
  paymentPlanId?: PaymentPlanId;
  datePaid?: Date;
}) {
  const user = await prisma.user.update({
    where: { paymentProcessorUserId },
    data: { subscriptionPlan: paymentPlanId, subscriptionStatus, datePaid },
  });

  try {
    if (subscriptionStatus === SubscriptionStatus.Deleted || !paymentPlanId) {
      if (user.email) await softDeletePostizSubscription(user.email);
    } else if (
      subscriptionStatus === SubscriptionStatus.Active ||
      subscriptionStatus === SubscriptionStatus.CancelAtPeriodEnd
    ) {
      const mapping = POSTIZ_TIER_MAP[paymentPlanId];
      if (mapping && user.email) {
        await updatePostizSubscription({
          email: user.email,
          tier: mapping.tier,
          period: "MONTHLY",
          totalChannels: mapping.totalChannels,
          postsPerMonth: mapping.postsPerMonth,
          cancelAt: subscriptionStatus === SubscriptionStatus.CancelAtPeriodEnd ? new Date() : null,
          identifier: paymentProcessorUserId,
        });
      }
    }
  } catch (err) {
    console.error("[postiz-sync] Failed to sync subscription:", err);
  }

  return user;
}

export async function updateUserCredits({
  paymentProcessorUserId,
  numOfCreditsPurchased,
  datePaid,
}: {
  paymentProcessorUserId: string;
  numOfCreditsPurchased: number;
  datePaid: Date;
}) {
  return prisma.user.update({
    where: { paymentProcessorUserId },
    data: { credits: { increment: numOfCreditsPurchased }, datePaid },
  });
}
