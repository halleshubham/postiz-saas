import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [userCount, paidUserCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
  ]);

  const existing = await prisma.dailyStats.findUnique({ where: { date: today } });
  const prevDay = await prisma.dailyStats.findFirst({ where: { date: { lt: today } }, orderBy: { date: "desc" } });

  const prevViews = prevDay?.totalViews ?? 0;
  const todayStats = await prisma.dailyStats.upsert({
    where: { date: today },
    create: { date: today, userCount, paidUserCount, prevDayViewsChangePercent: "0" },
    update: {
      userCount,
      paidUserCount,
      userDelta: userCount - (prevDay?.userCount ?? 0),
      paidUserDelta: paidUserCount - (prevDay?.paidUserCount ?? 0),
      prevDayViewsChangePercent: prevViews > 0
        ? String(Math.round(((existing?.totalViews ?? 0) - prevViews) / prevViews * 100))
        : "0",
    },
  });

  return NextResponse.json({ stats: todayStats });
}
