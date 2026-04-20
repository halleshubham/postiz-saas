import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;
  const search = searchParams.get("search") ?? "";

  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        members: {
          include: { user: { select: { id: true, email: true, subscriptionPlan: true, subscriptionStatus: true } } },
          orderBy: { role: "asc" },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({ companies, total, page, pageSize });
}
