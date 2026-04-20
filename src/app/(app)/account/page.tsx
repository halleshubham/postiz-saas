import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCustomerPortalUrl } from "@/lib/stripe-checkout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  let portalUrl: string | null = null;
  try {
    portalUrl = await getCustomerPortalUrl(user.id);
  } catch {
    // portal not available — show upgrade link instead
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium capitalize">
              {user.subscriptionPlan ?? "Free"}
            </span>
            {user.subscriptionStatus && (
              <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
                {user.subscriptionStatus.replace("_", " ")}
              </Badge>
            )}
          </div>
          {user.datePaid && (
            <p className="text-xs text-muted-foreground">
              Last paid: {new Date(user.datePaid).toLocaleDateString()}
            </p>
          )}
          {portalUrl ? (
            <Button asChild variant="outline" className="w-full">
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage billing in Stripe
              </a>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/pricing">Upgrade plan</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
