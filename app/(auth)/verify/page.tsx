"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [state, setState] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    async function go() {
      if (!token) return;
      setState("loading");
      try {
        // Try GET first, then fallback to POST
        try {
          await api.get(`/auth/verify`, { params: { token } });
        } catch {
          await api.post(`/auth/verify`, { token });
        }
        setState("ok");
        setMsg("Email verified! You can now continue.");
        setTimeout(() => router.replace("/chat"), 1200);
      } catch (e: any) {
        setState("err");
        setMsg("Verification failed or link expired.");
      }
    }
    go();
  }, [token, router]);

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4 text-center">
          <h1 className="text-xl font-semibold">Verify your email</h1>
          <p className="text-sm text-zinc-600">
            {state === "loading" && "Verifying..."}
            {state === "ok" && msg}
            {state === "err" && msg}
            {state === "idle" && (!token ? "No token provided." : "Working…")}
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.replace("/chat")}>Back to app</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
