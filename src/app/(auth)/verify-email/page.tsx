"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); setMessage("No token provided."); return; }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message) { setStatus("success"); setMessage(data.message); }
        else { setStatus("error"); setMessage(data.error ?? "Verification failed."); }
      })
      .catch(() => { setStatus("error"); setMessage("Something went wrong."); });
  }, [params]);

  return (
    <div className="text-center">
      {status === "loading" && <p className="text-muted-foreground">Verifying…</p>}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Email verified!</h1>
          <p className="text-muted-foreground mb-4">{message}</p>
          <Link href="/login" className="text-primary hover:underline">Log in now</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-destructive mb-2">Verification failed</h1>
          <p className="text-muted-foreground mb-4">{message}</p>
          <Link href="/login" className="text-primary hover:underline">Back to login</Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailContent /></Suspense>;
}
