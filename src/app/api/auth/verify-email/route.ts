import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
    await prisma.emailVerificationToken.delete({ where: { token } });

    return NextResponse.json({ message: "Email verified" });
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
