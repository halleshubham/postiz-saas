import { SessionProvider } from "next-auth/react";
import { NavBar } from "@/components/navbar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavBar />
      {children}
    </SessionProvider>
  );
}
