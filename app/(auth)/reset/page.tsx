// app/(auth)/reset/page.tsx  (or app/auth/reset/page.tsx)
"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";

// Force this route to be dynamic so Vercel doesn’t try to prerender it
export const dynamic = "force-dynamic";

const RequestSchema = z.object({ email: z.string().email() });
type RequestValues = z.infer<typeof RequestSchema>;

const ResetSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type ResetValues = z.infer<typeof ResetSchema>;

// Inner client component that uses useSearchParams
function ResetContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [done, setDone] = useState<string>("");

  // Request flow (no token)
  const reqForm = useForm<RequestValues>({
    resolver: zodResolver(RequestSchema),
    defaultValues: { email: "" },
  });

  async function onRequest(values: RequestValues) {
    try {
      await api.post("/auth/request-reset", values);
      setDone("If your email exists, a reset link has been sent.");
    } catch {
      setDone("If your email exists, a reset link has been sent.");
    }
  }

  // Apply flow (with token)
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onReset(values: ResetValues) {
    try {
      await api.post("/auth/reset", { token, password: values.password });
      setDone("Password updated. Redirecting to login…");
      setTimeout(() => router.replace("/login"), 1200);
    } catch {
      resetForm.setError("password", { message: "Reset failed or link expired" });
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          {!token ? (
            <>
              <h1 className="text-xl font-semibold">Forgot password</h1>
              <Form {...reqForm}>
                <form onSubmit={reqForm.handleSubmit(onRequest)} className="space-y-3">
                  <FormField
                    control={reqForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit">Send reset link</Button>
                </form>
              </Form>
              {done && <p className="text-sm text-emerald-700">{done}</p>}
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Set a new password</h1>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-3">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit">Update password</Button>
                </form>
              </Form>
              {done && <p className="text-sm text-emerald-700">{done}</p>}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

// Export wrapped in Suspense to satisfy Next.js CSR bailout rule
export default function ResetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <ResetContent />
    </Suspense>
  );
}
