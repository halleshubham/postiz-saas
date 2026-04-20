import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { postizPrisma } from "@/lib/postiz-db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? undefined;

  const where = search ? { email: { contains: search, mode: "insensitive" as const } } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, username: true, isAdmin: true, subscriptionPlan: true, subscriptionStatus: true, createdAt: true, credits: true },
    }),
    prisma.user.count({ where }),
  ]);

  // Enrich with Postiz DB data
  let postizMap: Record<string, { activated: boolean; orgName: string | null; tier: string | null; channels: number | null; postsPerMonth: number | null; deletedAt: string | null }> = {};
  try {
    const emails = users.map((u) => u.email);
    const postizUsers = await (postizPrisma as any).user.findMany({
      where: { email: { in: emails } },
      include: {
        organizationUsers: {
          include: {
            organization: {
              include: { subscription: true },
            },
          },
          take: 1,
        },
      },
    });

    for (const pu of postizUsers) {
      const orgUser = pu.organizationUsers?.[0];
      const org = orgUser?.organization;
      const sub = org?.subscription;
      postizMap[pu.email] = {
        activated: pu.activated,
        orgName: org?.name ?? null,
        tier: sub?.subscriptionTier ?? null,
        channels: sub?.totalChannels ?? null,
        postsPerMonth: sub?.postsPerMonth ?? null,
        deletedAt: sub?.deletedAt ?? null,
      };
    }
  } catch {
    // Postiz DB unavailable — return users without enrichment
  }

  const enriched = users.map((u) => ({
    ...u,
    postiz: postizMap[u.email] ?? null,
  }));

  return NextResponse.json({ users: enriched, total, page, pageSize });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, isAdmin } = await req.json();
  const user = await prisma.user.update({ where: { id: userId }, data: { isAdmin } });
  return NextResponse.json({ user });
}
