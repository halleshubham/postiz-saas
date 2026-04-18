import { CreditCard, ExternalLink } from "lucide-react";
import { getCompanyDashboard, getCustomerPortalUrl, useQuery } from "wasp/client/operations";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { CompanyOnboarding } from "./CompanyOnboarding";

const POSTIZ_INSTANCE_URL = "https://app.shackyapps.in";

function planLabel(plan: string | null) {
  if (plan === "starter") return "Starter";
  if (plan === "growth") return "Growth";
  return "Free";
}

function statusLabel(status: string | null) {
  if (status === "active") return "Active";
  if (status === "cancel_at_period_end") return "Cancelling at period end";
  if (status === "past_due") return "Past due";
  if (status === "deleted") return "Cancelled";
  return "No active subscription";
}

function statusColor(status: string | null) {
  if (status === "active") return "text-green-600 dark:text-green-400";
  if (status === "cancel_at_period_end") return "text-yellow-600 dark:text-yellow-400";
  if (status === "past_due") return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery(getCompanyDashboard);
  const { data: portalUrl } = useQuery(getCustomerPortalUrl);

  if (isLoading) return <div className="px-6 py-16">Loading dashboard...</div>;
  if (error) return <div className="text-destructive px-6 py-16">{error.message}</div>;
  if (!data?.company) return <CompanyOnboarding />;

  const plan = data.subscriptionPlan;
  const status = data.subscriptionStatus;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm">Company workspace</p>
        <h1 className="text-4xl font-bold">{data.company.name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-semibold">{planLabel(plan)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-semibold ${statusColor(status)}`}>
              {statusLabel(status)}
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            {portalUrl ? (
              <Button asChild variant="outline">
                <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                  Manage Subscription
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <WaspRouterLink to={routes.PricingPageRoute.to}>
                  View Plans
                </WaspRouterLink>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <a
        href={POSTIZ_INSTANCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-3 rounded-lg px-6 py-4 text-lg font-semibold transition-colors"
      >
        <ExternalLink className="size-5" />
        Go to Postiz
      </a>
    </main>
  );
}
