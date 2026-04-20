"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Sign up failed");
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground">We sent a verification link to <strong>{email}</strong>. Click it to activate your account.</p>
        <Link href="/login" className="mt-4 block text-primary hover:underline">Back to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Create an account</h1>
      <p className="text-muted-foreground text-sm mb-6">Get started with Shacky Social</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account…" : "Sign up"}</Button>
      </form>
      <p className="mt-4 text-sm text-center text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link></p>
    </div>
  );
}
