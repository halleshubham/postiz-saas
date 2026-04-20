import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stats = await prisma.dailyStats.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { sources: true },
  });

  return NextResponse.json({ stats });
}
