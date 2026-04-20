import { getStripe } from "./stripe";
import { getPaymentProcessorPlanId } from "./plan-ids";
import { type PaymentPlan, type PaymentPlanEffect } from "./plans";
import { updateUserPaymentProcessorUserId } from "./user-payment";

export async function ensureStripeCustomer(userEmail: string) {
  const stripe = getStripe();
  const existing = await stripe.customers.list({ email: userEmail });
  if (existing.data.length > 0) return existing.data[0];
  return stripe.customers.create({ email: userEmail });
}

function planEffectToMode(effect: PaymentPlanEffect): "subscription" | "payment" {
  return effect.kind === "subscription" ? "subscription" : "payment";
}

export async function createCheckoutSession({
  userId,
  userEmail,
  paymentPlan,
}: {
  userId: string;
  userEmail: string;
  paymentPlan: PaymentPlan;
}) {
  const stripe = getStripe();
  const customer = await ensureStripeCustomer(userEmail);
  await updateUserPaymentProcessorUserId(userId, customer.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const mode = planEffectToMode(paymentPlan.effect);
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    line_items: [{ price: getPaymentProcessorPlanId(paymentPlan), quantity: 1 }],
    mode,
    success_url: `${appUrl}/checkout?status=success`,
    cancel_url: `${appUrl}/checkout?status=canceled`,
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    customer_update: { address: "auto" },
    ...(mode === "payment" ? { invoice_creation: { enabled: true } } : {}),
  });

  if (!session.url) throw new Error("Stripe checkout session URL is missing");
  return { sessionUrl: session.url, sessionId: session.id };
}

export async function getCustomerPortalUrl(userId: string) {
  const stripe = getStripe();
  const { prisma } = await import("./db");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { paymentProcessorUserId: true },
  });
  if (!user?.paymentProcessorUserId) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: user.paymentProcessorUserId,
    return_url: `${appUrl}/account`,
  });
  return session.url;
}
