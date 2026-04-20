import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const stats = await prisma.dailyStats.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });

  const totalUsers = await prisma.user.count();
  const totalSubscribers = await prisma.user.count({
    where: { subscriptionStatus: "active" },
  });

  const latestStat = stats[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalUsers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Active Subscribers</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalSubscribers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Daily Revenue (latest)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {latestStat ? `$${(latestStat.totalRevenue / 100).toFixed(2)}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Daily Stats</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Views</th>
                  <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Users</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 text-right">{s.totalViews.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right">{s.userCount.toLocaleString()}</td>
                    <td className="py-2 text-right">${(s.totalRevenue / 100).toFixed(2)}</td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No stats yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
