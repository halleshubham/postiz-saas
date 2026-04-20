"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Moon, Sun, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function NavBar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Shacky Social
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
              <a href={process.env.NEXT_PUBLIC_POSTIZ_INSTANCE_URL ?? "https://app.shackyapps.in"} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                Launch Postiz <ExternalLink className="h-3 w-3" />
              </a>
              <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">Account</Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="outline" size="sm">Log in</Button></Link>
              <Link href="/signup"><Button size="sm">Sign up</Button></Link>
            </>
          )}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1 rounded text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
          <Link href="/pricing" className="text-sm" onClick={() => setMobileOpen(false)}>Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <a href={process.env.NEXT_PUBLIC_POSTIZ_INSTANCE_URL ?? "https://app.shackyapps.in"} target="_blank" rel="noreferrer" className="text-sm flex items-center gap-1">Launch Postiz <ExternalLink className="h-3 w-3" /></a>
              <Link href="/account" className="text-sm" onClick={() => setMobileOpen(false)}>Account</Link>
              <Button variant="outline" size="sm" onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" size="sm" className="w-full">Log in</Button></Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)}><Button size="sm" className="w-full">Sign up</Button></Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
