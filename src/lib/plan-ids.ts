import { type PaymentPlan, PaymentPlanId } from "./plans";

export function getPaymentProcessorPlanId(paymentPlan: PaymentPlan): string {
  const ids: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Hobby]: process.env.STRIPE_HOBBY_PRICE_ID!,
    [PaymentPlanId.Pro]: process.env.STRIPE_PRO_PRICE_ID!,
    [PaymentPlanId.Credits10]: process.env.STRIPE_CREDITS10_PRICE_ID ?? "credits-disabled",
  };
  return ids[paymentPlan.id];
}

export function getPaymentPlanIdByProcessorPlanId(processorPlanId: string): PaymentPlanId {
  const ids: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Hobby]: process.env.STRIPE_HOBBY_PRICE_ID!,
    [PaymentPlanId.Pro]: process.env.STRIPE_PRO_PRICE_ID!,
    [PaymentPlanId.Credits10]: process.env.STRIPE_CREDITS10_PRICE_ID ?? "credits-disabled",
  };
  for (const [planId, id] of Object.entries(ids)) {
    if (id === processorPlanId) return planId as PaymentPlanId;
  }
  throw new Error(`Unknown processor plan ID: ${processorPlanId}`);
}
