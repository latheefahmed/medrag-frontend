"use client";

import type { AdminUser } from "@/hooks/useAdmin";

export default function UserTable({ rows }: { rows: AdminUser[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-700">
          <tr>
            <th className="text-left px-3 py-2">Email</th>
            <th className="text-left px-3 py-2">Role</th>
            <th className="text-left px-3 py-2">Verified</th>
            <th className="text-left px-3 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.email} className="border-t">
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.role}</td>
              <td className="px-3 py-2">{u.verified ? "Yes" : "No"}</td>
              <td className="px-3 py-2">{u.created_at ? new Date(u.created_at).toLocaleString() : "—"}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td className="px-3 py-6 text-zinc-500" colSpan={4}>No users found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
