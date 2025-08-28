"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type AdminUser = { email: string; role: string; verified?: boolean; created_at?: number };
export type AdminSession = { id: string; user_id: string; title?: string; updatedAt?: number };

export function useAdminUsers(params?: { role?: string; verified?: boolean; limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ["admin_users", params],
    queryFn: async () => {
      const { data } = await api.get("/admin/users", { params }); // backend TODO
      return data as { items: AdminUser[]; next_cursor?: string };
    },
  });
}

export function useAdminSessions(params?: { user_id?: string; limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ["admin_sessions", params],
    queryFn: async () => {
      const { data } = await api.get("/admin/sessions", { params }); // backend TODO
      return data as { items: AdminSession[]; next_cursor?: string };
    },
  });
}

export function useAdminUsage(params?: { range?: "24h" | "7d" | "30d" }) {
  return useQuery({
    queryKey: ["admin_usage", params],
    queryFn: async () => {
      const { data } = await api.get("/admin/usage", { params }); // backend TODO
      return data as {
        total_calls?: number;
        total_tokens?: number;
        per_user?: Array<{ email: string; calls: number; tokens?: number }>;
      };
    },
  });
}
