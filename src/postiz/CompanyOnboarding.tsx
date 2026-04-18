import { useState } from "react";
import { createCompany, useQuery, getCompanyDashboard } from "wasp/client/operations";
import { Button } from "../client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { Input } from "../client/components/ui/input";

export function CompanyOnboarding() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dashboardQuery = useQuery(getCompanyDashboard);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createCompany({ name });
      await dashboardQuery.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create company.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create your company workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Your company workspace keeps users, connected social accounts, and scheduled posts together.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Company name"
              minLength={2}
              required
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit">Create workspace</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
