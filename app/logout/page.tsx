"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
export default function LogoutPage() {
  const { logout } = useAuth();
  useEffect(() => { logout(); }, [logout]);
  return <main className="p-6 text-sm text-zinc-600">Signing you out…</main>;
}
