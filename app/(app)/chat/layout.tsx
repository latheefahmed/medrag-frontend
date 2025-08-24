"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import RoleBadge from "@/components/RoleBadge";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { me, meLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!meLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, meLoading, router]);

  if (meLoading || !isAuthenticated) {
    return <main className="p-6 text-sm text-zinc-600">Loading…</main>;
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Keep this header simple; toggles live in page.tsx */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-[1700px] px-5 py-2 flex items-center gap-3">
          <div className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME ?? "MedRAG"}</div>
          <div className="ml-auto flex items-center gap-2">
            {me?.role && <RoleBadge role={me.role as any} />}
            <span className="text-sm text-zinc-700">{me?.email}</span>
            <button
              className="rounded-md border px-3 py-1 text-sm"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100dvh-48px)]">{children}</main>
    </div>
  );
}
