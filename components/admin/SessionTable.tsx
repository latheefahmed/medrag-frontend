"use client";

import type { AdminSession } from "@/hooks/useAdmin";

export default function SessionTable({ rows }: { rows: AdminSession[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-700">
          <tr>
            <th className="text-left px-3 py-2">Session ID</th>
            <th className="text-left px-3 py-2">User</th>
            <th className="text-left px-3 py-2">Title</th>
            <th className="text-left px-3 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="px-3 py-2">{s.id}</td>
              <td className="px-3 py-2">{s.user_id}</td>
              <td className="px-3 py-2">{s.title ?? "—"}</td>
              <td className="px-3 py-2">{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "—"}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="px-3 py-6 text-zinc-500" colSpan={4}>No sessions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
