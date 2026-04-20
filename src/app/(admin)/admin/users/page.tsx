"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PostizInfo {
  activated: boolean;
  orgName: string | null;
  tier: string | null;
  channels: number | null;
  postsPerMonth: number | null;
  deletedAt: string | null;
}

interface UserRow {
  id: string;
  email: string;
  isAdmin: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  postiz: PostizInfo | null;
}

interface PageData {
  users: UserRow[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    setData(await res.json());
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleAdmin(userId: string, current: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAdmin: !current }),
    });
    fetchUsers();
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Input
          placeholder="Search email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {data ? `${data.total} total users` : "Loading…"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Postiz org</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Postiz tier</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Channels</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Admin</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {!loading && data?.users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4 capitalize">{u.subscriptionPlan ?? "—"}</td>
                    <td className="py-3 px-4">
                      {u.subscriptionStatus ? (
                        <Badge variant={u.subscriptionStatus === "active" ? "default" : "secondary"}>
                          {u.subscriptionStatus.replace("_", " ")}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {u.postiz ? (
                        <span className={u.postiz.activated ? "" : "text-muted-foreground line-through"}>
                          {u.postiz.orgName ?? "—"}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">no account</span>}
                    </td>
                    <td className="py-3 px-4">
                      {u.postiz?.tier ? (
                        <Badge variant={u.postiz.deletedAt ? "secondary" : "outline"}>
                          {u.postiz.tier}{u.postiz.deletedAt ? " (cancelled)" : ""}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {u.postiz?.channels != null
                        ? `${u.postiz.channels} ch / ${(u.postiz.postsPerMonth ?? 0).toLocaleString()} posts`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={u.isAdmin ? "default" : "outline"}
                        onClick={() => toggleAdmin(u.id, u.isAdmin)}
                      >
                        {u.isAdmin ? "Admin" : "Make admin"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && data?.users.length === 0 && (
                  <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
