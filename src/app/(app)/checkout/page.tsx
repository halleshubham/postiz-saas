"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutContent() {
  const params = useSearchParams();
  const status = params.get("status");

  if (status === "success") {
    return (
      <div className="text-center max-w-md mx-auto mt-16">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your subscription is now active. Head to your dashboard to access Postiz.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="text-center max-w-md mx-auto mt-16">
        <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment cancelled</h1>
        <p className="text-muted-foreground mb-6">
          No charges were made. You can choose a plan whenever you&apos;re ready.
        </p>
        <Button variant="outline" asChild>
          <Link href="/pricing">View plans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6">Please contact support if you were charged.</p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
