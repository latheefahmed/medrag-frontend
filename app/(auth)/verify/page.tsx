// app/(auth)/verify/page.tsx  (or app/auth/verify/page.tsx)
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

// prevent prerender; this route depends on query params
export const dynamic = "force-dynamic";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [status, setStatus] = useState<"idle" | "ok" | "error" | "missing">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setStatus("missing");
        setMsg("Missing verification token.");
        return;
      }
      try {
        await api.get("/auth/verify", { params: { token } });
        if (cancelled) return;
        setStatus("ok");
        setMsg("Email verified. Redirecting to login…");
        setTimeout(() => router.replace("/login"), 1200);
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMsg("Link invalid or expired.");
      }
    }

    run();
    return () => { cancelled = true; };
  }, [token, router]);

  const title =
    status === "ok" ? "Verified" :
    status === "error" ? "Verification failed" :
    "Verify email";

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {msg || "Checking your link…"}
          </p>
          <div className="pt-2">
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <VerifyContent />
    </Suspense>
  );
}
