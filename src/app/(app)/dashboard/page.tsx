import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CompanyOnboarding from "@/components/company-onboarding";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      companyMemberships: {
        include: { company: true },
        take: 1,
      },
    },
  });

  if (!user) redirect("/login");

  const membership = user.companyMemberships[0];
  const postizUrl = process.env.NEXT_PUBLIC_POSTIZ_INSTANCE_URL ?? "https://app.shackyapps.in";

  if (!membership) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Shacky Social</h1>
        <p className="text-muted-foreground mb-6">Set up your workspace to get started.</p>
        <CompanyOnboarding />
      </div>
    );
  }

  const company = membership.company;
  const status = user.subscriptionStatus;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">{company.name}</p>
              <p className="text-xs text-muted-foreground">Company</p>
            </div>
            <Button asChild className="w-full">
              <a href={postizUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Postiz
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{user.subscriptionPlan ?? "Free"}</span>
              {status && (
                <Badge variant={status === "active" ? "default" : "secondary"}>
                  {status.replace("_", " ")}
                </Badge>
              )}
            </div>
            {user.datePaid && (
              <p className="text-xs text-muted-foreground">
                Last paid: {new Date(user.datePaid).toLocaleDateString()}
              </p>
            )}
            <Button variant="outline" asChild className="w-full">
              <Link href="/account">Manage subscription</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
