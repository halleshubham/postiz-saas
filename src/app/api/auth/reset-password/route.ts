import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";

const schema = z.object({ token: z.string(), password: z.string().min(8) });

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    if (record.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({ where: { id: record.userId }, data: { hashedPassword } });
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password updated" });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
