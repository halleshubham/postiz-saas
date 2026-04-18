import * as z from "zod";
import { paymentPlansSchema } from "../env";

export const stripeEnvSchema = paymentPlansSchema.extend({
  STRIPE_API_KEY: z.string().default("sk_test_replace_me"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_replace_me"),
});
