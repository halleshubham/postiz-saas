import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to avoid email enumeration
    if (user) await sendPasswordResetEmail(user.id, user.email);

    return NextResponse.json({ message: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error("Request reset error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
