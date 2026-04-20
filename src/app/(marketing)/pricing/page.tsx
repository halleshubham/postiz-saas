"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { PaymentPlanId, paymentPlans, prettyPaymentPlanName } from "@/lib/plans";

const paymentPlanCards: Record<PaymentPlanId, { name: string; price: string; description: string; features: string[] }> = {
  [PaymentPlanId.Hobby]: {
    name: prettyPaymentPlanName(PaymentPlanId.Hobby),
    price: "₹999",
    description: "For one company getting started with scheduled publishing",
    features: ["3 company users", "5 connected social accounts", "300 scheduled posts per month", "Email support"],
  },
  [PaymentPlanId.Pro]: {
    name: prettyPaymentPlanName(PaymentPlanId.Pro),
    price: "₹2,999",
    description: "For growing teams that publish across more channels",
    features: ["10 company users", "20 connected social accounts", "2,000 scheduled posts per month", "Priority support"],
  },
  [PaymentPlanId.Credits10]: {
    name: prettyPaymentPlanName(PaymentPlanId.Credits10),
    price: "Custom",
    description: "For higher volume publishing and onboarding help",
    features: ["Custom account limits", "Migration assistance", "Dedicated support"],
  },
};

const bestDeal = PaymentPlanId.Pro;

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuyNow(planId: PaymentPlanId) {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        setError(data.error ?? "Error creating checkout session");
        setLoading(false);
      }
    } catch {
      setError("Error processing payment. Please try again later.");
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    if (!session) { router.push("/login"); return; }
    const res = await fetch("/api/stripe/portal");
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
    else setError(data.error ?? "Could not open customer portal");
  }

  const isSubscribed = !!(session?.user as { subscriptionStatus?: string })?.subscriptionStatus;

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Pick your <span className="text-primary">company plan</span>
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg leading-8">
          Start with one company workspace, connect social accounts through Postiz, and invite the people who schedule content.
        </p>
        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {Object.values(PaymentPlanId).map((planId) => (
            <Card
              key={planId}
              className={cn(
                "relative flex grow flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg",
                {
                  "ring-primary ring-2": planId === bestDeal,
                  "ring-border ring-1 lg:my-8": planId !== bestDeal,
                },
              )}
            >
              <CardContent className="h-full justify-between p-8 xl:p-10">
                <div className="flex items-center justify-between gap-x-4">
                  <CardTitle className="text-foreground text-lg font-semibold leading-8">
                    {paymentPlanCards[planId].name}
                  </CardTitle>
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-6">
                  {paymentPlanCards[planId].description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-foreground text-4xl font-bold tracking-tight">
                    {paymentPlanCards[planId].price}
                  </span>
                  <span className="text-muted-foreground text-sm font-semibold leading-6">
                    {paymentPlans[planId].effect.kind === "subscription" && "/month"}
                  </span>
                </p>
                <ul role="list" className="text-muted-foreground mt-8 space-y-3 text-sm leading-6">
                  {paymentPlanCards[planId].features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckCircle className="text-primary h-5 w-5 flex-none" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isSubscribed ? (
                  <Button
                    onClick={handleManageSubscription}
                    variant={planId === bestDeal ? "default" : "outline"}
                    className="w-full"
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleBuyNow(planId)}
                    variant={planId === bestDeal ? "default" : "outline"}
                    className="w-full"
                    disabled={loading}
                  >
                    {session ? "Buy plan" : "Log in to buy plan"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
