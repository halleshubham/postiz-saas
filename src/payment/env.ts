import * as z from "zod";

export const paymentPlansSchema = z.object({
  PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID: z.string().default("starter-dev-price"),
  PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID: z.string().default("growth-dev-price"),
  PAYMENTS_CREDITS_10_PLAN_ID: z.string().default("credits-disabled"),
});
