import { SessionProvider } from "next-auth/react";
import { NavBar } from "@/components/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavBar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </SessionProvider>
  );
}
