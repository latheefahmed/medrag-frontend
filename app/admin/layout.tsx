"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import RoleBadge from "@/components/RoleBadge";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { me, meLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!meLoading && (!isAuthenticated || me?.role !== "admin")) {
      router.replace("/chat");
    }
  }, [meLoading, isAuthenticated, me?.role, router]);

  if (meLoading || !isAuthenticated) return <div className="p-6">Loading…</div>;
  if (me?.role !== "admin") return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-[1700px] px-5 py-2 flex items-center gap-3">
          <div className="font-semibold">Admin</div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="underline" href="/admin/dashboard">Dashboard</Link>
            <Link className="underline" href="/admin/users">Users</Link>
            <Link className="underline" href="/admin/sessions">Sessions</Link>
          </nav>
          <div className="ml-auto"><RoleBadge role="admin" /></div>
        </div>
      </header>
      <main className="mx-auto max-w-[1700px] px-5 py-6">{children}</main>
    </div>
  );
}
