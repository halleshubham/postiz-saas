import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { isAdmin?: boolean }).isAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold">Admin</span>
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">Overview</Link>
        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
        <Link href="/dashboard" className="ml-auto text-muted-foreground hover:text-foreground">← Back to app</Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
