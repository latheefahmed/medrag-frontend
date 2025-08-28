"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import RoleBadge from "@/components/RoleBadge";
import { api } from "@/lib/api";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { me, meLoading, isAuthenticated, logout } = useAuth();
  const [resent, setResent] = useState<null | "ok" | "err">(null);

  useEffect(() => {
    if (!meLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, meLoading, router]);

  if (meLoading || !isAuthenticated) {
    return <main className="p-6 text-sm text-zinc-600">Loading…</main>;
  }

  async function resendVerification() {
    try {
      await api.post("/auth/resend-verification");
      setResent("ok");
    } catch {
      setResent("err");
    } finally {
      setTimeout(() => setResent(null), 3500);
    }
  }

  // Header is ~56px tall; main fills the remainder and owns scrolling.
  return (
    <div className="h-[100dvh] overflow-hidden">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-[1700px] px-5 py-2 flex items-center gap-3">
          <div className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME ?? "MedRAG"}</div>
          <div className="ml-auto flex items-center gap-2">
            {me?.role && <RoleBadge role={me.role as any} />}
            <span className="text-sm text-zinc-700">{me?.email}</span>
            <button
              className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-50"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </div>
        {me?.verified === false && (
          <div className="bg-amber-50 border-t border-amber-200">
            <div className="mx-auto max-w-[1700px] px-5 py-2 text-sm flex items-center gap-3">
              <span className="text-amber-800">Please verify your email to unlock all features.</span>
              <button
                className="ml-auto rounded-md border px-3 py-1 text-sm text-amber-900 bg-white hover:bg-amber-100"
                onClick={resendVerification}
              >
                Resend verification link
              </button>
              {resent === "ok" && <span className="text-emerald-700">Sent ✓</span>}
              {resent === "err" && <span className="text-red-600">Failed to send</span>}
            </div>
          </div>
        )}
      </header>

      <main className="h-[calc(100dvh-56px)] overflow-hidden">{children}</main>
    </div>
  );
}
