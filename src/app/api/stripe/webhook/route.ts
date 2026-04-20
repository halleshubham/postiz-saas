import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent, handleStripeEvent, UnhandledWebhookEventError } from "@/lib/stripe-webhook";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  try {
    const event = constructStripeEvent(body, signature);
    await handleStripeEvent(event);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.info("Unhandled Stripe event:", err.message);
      return new NextResponse(null, { status: 204 });
    }
    console.error("Stripe webhook error:", err);
    const msg = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
