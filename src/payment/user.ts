import { User } from "wasp/entities";
import { PrismaClient } from "wasp/server";
import { PaymentPlanId, SubscriptionStatus } from "./plans";
import {
  updatePostizSubscription,
  softDeletePostizSubscription,
} from "../postiz-db/postizUserService";

// SaaS plan → Postiz subscription tier mapping
const POSTIZ_TIER_MAP: Record<
  string,
  { tier: "STANDARD" | "PRO"; totalChannels: number; postsPerMonth: number }
> = {
  starter: { tier: "STANDARD", totalChannels: 5, postsPerMonth: 400 },
  growth: { tier: "PRO", totalChannels: 30, postsPerMonth: 1_000_000 },
};

export async function fetchUserPaymentProcessorUserId(
  userId: User["id"],
  prismaUserDelegate: PrismaClient["user"],
): Promise<string | null> {
  const user = await prismaUserDelegate.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      paymentProcessorUserId: true,
    },
  });

  return user.paymentProcessorUserId;
}

interface UpdateUserPaymentProcessorUserIdArgs {
  userId: User["id"];
  paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
}

export function updateUserPaymentProcessorUserId(
  { userId, paymentProcessorUserId }: UpdateUserPaymentProcessorUserIdArgs,
  prismaUserDelegate: PrismaClient["user"],
): Promise<User> {
  return prismaUserDelegate.update({
    where: {
      id: userId,
    },
    data: {
      paymentProcessorUserId,
    },
  });
}

interface UpdateUserSubscriptionArgs {
  paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
  subscriptionStatus: SubscriptionStatus;
  paymentPlanId?: PaymentPlanId;
  datePaid?: Date;
}

export async function updateUserSubscription(
  {
    paymentProcessorUserId,
    paymentPlanId,
    subscriptionStatus,
    datePaid,
  }: UpdateUserSubscriptionArgs,
  userDelegate: PrismaClient["user"],
): Promise<User> {
  const user = await userDelegate.update({
    where: {
      paymentProcessorUserId,
    },
    data: {
      subscriptionPlan: paymentPlanId,
      subscriptionStatus,
      datePaid,
    },
  });

  // Sync subscription to Postiz DB
  try {
    if (
      subscriptionStatus === SubscriptionStatus.Deleted ||
      !paymentPlanId
    ) {
      // Subscription cancelled/deleted → soft-delete in Postiz
      if (user.email) {
        await softDeletePostizSubscription(user.email);
      }
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
          cancelAt:
            subscriptionStatus === SubscriptionStatus.CancelAtPeriodEnd
              ? new Date() // Will be overridden by Stripe's actual cancel_at if available
              : null,
          identifier: paymentProcessorUserId,
        });
      }
    }
  } catch (err) {
    // Log but don't fail the SaaS subscription update
    console.error("[postiz-sync] Failed to sync subscription to Postiz DB:", err);
  }

  return user;
}

interface UpdateUserCreditsArgs {
  paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
  numOfCreditsPurchased: number;
  datePaid: Date;
}

export function updateUserCredits(
  {
    paymentProcessorUserId,
    numOfCreditsPurchased,
    datePaid,
  }: UpdateUserCreditsArgs,
  userDelegate: PrismaClient["user"],
): Promise<User> {
  return userDelegate.update({
    where: {
      paymentProcessorUserId,
    },
    data: {
      credits: { increment: numOfCreditsPurchased },
      datePaid,
    },
  });
}
