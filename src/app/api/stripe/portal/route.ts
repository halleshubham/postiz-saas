import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCustomerPortalUrl } from "@/lib/stripe-checkout";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = await getCustomerPortalUrl(session.user.id);
  return NextResponse.json({ url });
}
