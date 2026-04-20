import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, isAdminEmail } from "@/lib/auth-helpers";
import { sendVerificationEmail } from "@/lib/email-helpers";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
  username: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        username: username ?? email.split("@")[0],
        isAdmin: isAdminEmail(email),
        emailVerified: false,
      },
    });

    await sendVerificationEmail(user.id, user.email);

    return NextResponse.json({ message: "Account created. Check your email to verify." }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
