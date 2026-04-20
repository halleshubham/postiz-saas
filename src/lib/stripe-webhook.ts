import { getStripe } from "./stripe";
import { getPaymentPlanIdByProcessorPlanId } from "./plan-ids";
import { PaymentPlanId, paymentPlans, SubscriptionStatus } from "./plans";
import { updateUserSubscription, updateUserCredits } from "./user-payment";
import { sendEmail } from "./email";
import type Stripe from "stripe";

export class UnhandledWebhookEventError extends Error {
  constructor(eventType: string) {
    super(`Unhandled event type: ${eventType}`);
    this.name = "UnhandledWebhookEventError";
  }
}

export function constructStripeEvent(body: string, signature: string): Stripe.Event {
  return getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "invoice.paid":
      await handleInvoicePaid(event as Stripe.InvoicePaidEvent);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent);
      break;
    default:
      throw new UnhandledWebhookEventError(event.type);
  }
}

async function handleInvoicePaid(event: Stripe.InvoicePaidEvent) {
  const invoice = event.data.object;
  const customerId = getCustomerId(invoice.customer);
  const datePaid = getInvoicePaidDate(invoice);
  const priceId = getInvoicePriceId(invoice);
  const planId = getPaymentPlanIdByProcessorPlanId(priceId);

  if (planId === PaymentPlanId.Credits10) {
    await updateUserCredits({
      paymentProcessorUserId: customerId,
      numOfCreditsPurchased: (paymentPlans[planId].effect as any).amount,
      datePaid,
    });
  } else {
    await updateUserSubscription({
      paymentProcessorUserId: customerId,
      paymentPlanId: planId,
      subscriptionStatus: SubscriptionStatus.Active,
      datePaid,
    });
  }
}

async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent) {
  const sub = event.data.object;
  const status = stripeStatusToSubscriptionStatus(sub);
  if (!status) return;

  const customerId = getCustomerId(sub.customer);
  const priceId = getSubscriptionPriceId(sub);
  const planId = getPaymentPlanIdByProcessorPlanId(priceId);

  const user = await updateUserSubscription({ paymentProcessorUserId: customerId, paymentPlanId: planId, subscriptionStatus: status });

  if (sub.cancel_at_period_end && user?.email) {
    await sendEmail(user.email, "We hate to see you go :(", "Your subscription will end at the period end. Come back anytime!");
  }
}

async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const sub = event.data.object;
  await updateUserSubscription({
    paymentProcessorUserId: getCustomerId(sub.customer),
    subscriptionStatus: SubscriptionStatus.Deleted,
  });
}

function stripeStatusToSubscriptionStatus(sub: Stripe.Subscription): SubscriptionStatus | undefined {
  const map: Record<string, SubscriptionStatus | undefined> = {
    active: SubscriptionStatus.Active,
    trialing: SubscriptionStatus.Active,
    past_due: SubscriptionStatus.PastDue,
    canceled: SubscriptionStatus.Deleted,
    unpaid: SubscriptionStatus.Deleted,
    incomplete_expired: SubscriptionStatus.Deleted,
    paused: undefined,
    incomplete: undefined,
  };
  const status = map[sub.status];
  if (status === SubscriptionStatus.Active && sub.cancel_at_period_end) return SubscriptionStatus.CancelAtPeriodEnd;
  return status;
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string {
  if (!customer) throw new Error("Customer missing");
  return typeof customer === "string" ? customer : customer.id;
}

function getInvoicePriceId(invoice: Stripe.Invoice): string {
  const items = invoice.lines.data;
  if (items.length !== 1) throw new Error("Expected exactly one line item");
  const price = items[0].pricing?.price_details?.price;
  if (!price) throw new Error("No price ID on invoice");
  return price;
}

function getSubscriptionPriceId(sub: Stripe.Subscription): string {
  if (sub.items.data.length !== 1) throw new Error("Expected exactly one subscription item");
  return sub.items.data[0].price.id;
}

function getInvoicePaidDate(invoice: Stripe.Invoice): Date {
  if (!invoice.status_transitions.paid_at) throw new Error("Invoice not paid yet");
  return new Date(invoice.status_transitions.paid_at * 1000);
}
