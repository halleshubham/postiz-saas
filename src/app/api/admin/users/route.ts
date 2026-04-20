import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const emailFilter = searchParams.get("email") ?? undefined;

  const where = emailFilter ? { email: { contains: emailFilter, mode: "insensitive" as const } } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, username: true, isAdmin: true, subscriptionPlan: true, subscriptionStatus: true, createdAt: true, credits: true },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, isAdmin } = await req.json();
  const user = await prisma.user.update({ where: { id: userId }, data: { isAdmin } });
  return NextResponse.json({ user });
}
