import { SessionProvider } from "next-auth/react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
        <Link href="/" className="mb-8 text-2xl font-bold text-primary">Shacky Social</Link>
        <div className="w-full max-w-md bg-background rounded-xl border shadow-sm p-8">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
