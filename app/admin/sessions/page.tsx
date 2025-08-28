"use client";

import { useAdminSessions } from "@/hooks/useAdmin";
import SessionTable from "@/components/admin/SessionTable";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSessionsPage() {
  const q = useAdminSessions({ limit: 50 });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="text-lg font-semibold">Sessions</div>
        {q.isLoading ? <div>Loading…</div> : <SessionTable rows={q.data?.items ?? []} />}
      </CardContent>
    </Card>
  );
}
