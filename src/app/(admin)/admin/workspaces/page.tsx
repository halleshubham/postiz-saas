"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Trash2, UserMinus } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    subscriptionPlan: string | null;
    subscriptionStatus: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  members: Member[];
}

interface PageData {
  companies: Workspace[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminWorkspacesPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/workspaces?${params}`);
    setData(await res.json());
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function deleteWorkspace(id: string, name: string) {
    if (!confirm(`Delete workspace "${name}" and all its members? This cannot be undone.`)) return;
    await fetch(`/api/admin/workspaces/${id}`, { method: "DELETE" });
    fetchWorkspaces();
  }

  async function removeMember(workspaceId: string, userId: string, email: string) {
    if (!confirm(`Remove ${email} from this workspace?`)) return;
    await fetch(`/api/admin/workspaces/${workspaceId}/members/${userId}`, { method: "DELETE" });
    fetchWorkspaces();
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <Input
          placeholder="Search workspace name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {data ? `${data.total} total workspaces` : "Loading…"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}
          {!loading && data?.companies.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No workspaces found</p>
          )}
          {!loading && data?.companies.map((ws) => (
            <div key={ws.id} className="border-b last:border-0">
              {/* Workspace row */}
              <div className="flex items-center gap-3 px-6 py-4">
                <button
                  onClick={() => toggleExpand(ws.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {expanded.has(ws.id)
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{ws.name}</p>
                  <p className="text-xs text-muted-foreground">{ws.slug}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {ws.members.length} {ws.members.length === 1 ? "member" : "members"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(ws.createdAt).toLocaleDateString()}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteWorkspace(ws.id, ws.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Expanded members */}
              {expanded.has(ws.id) && (
                <div className="bg-muted/30 px-6 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Plan</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ws.members.map((m) => (
                        <tr key={m.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{m.user.email}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={m.role === "OWNER" ? "default" : "secondary"}>
                              {m.role}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 capitalize text-muted-foreground">
                            {m.user.subscriptionPlan ?? "—"}
                            {m.user.subscriptionStatus && (
                              <span className="ml-1 text-xs">({m.user.subscriptionStatus.replace("_", " ")})</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeMember(ws.id, m.user.id, m.user.email)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {ws.members.length === 0 && (
                        <tr><td colSpan={4} className="py-3 text-muted-foreground">No members</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
