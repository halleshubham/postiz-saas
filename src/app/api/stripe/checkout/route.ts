import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe-checkout";
import { parsePaymentPlanId, paymentPlans } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.email) return NextResponse.json({ error: "Email required" }, { status: 403 });

  try {
    const { planId } = await req.json();
    const paymentPlanId = parsePaymentPlanId(planId);
    const paymentPlan = paymentPlans[paymentPlanId];

    const result = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      paymentPlan,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
