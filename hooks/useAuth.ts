// my-app/hooks/useAuth.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export type Me = { email: string; role?: string; verified?: boolean };

async function fetchMe(): Promise<Me> {
  const { data } = await api.get("/auth/me");
  return data;
}

type LoginArgs = { email: string; password: string };
type SignupArgs = { email: string; password: string; role: "student" | "researcher" | "data_analyst" | "doctor" | "clinician"; name?: string };

export function useAuth() {
  const qc = useQueryClient();
  const router = useRouter();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  const loginM = useMutation({
    mutationFn: async ({ email, password }: LoginArgs) => {
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/chat");
    },
  });

  const signupM = useMutation({
    mutationFn: async ({ email, password, role, name }: SignupArgs) => {
      // 🔑 Send role (and optional name) to backend
      await api.post("/auth/signup", { email, password, role, name });
      // auto-login for now (email verification comes next phase)
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/chat");
    },
  });

  const logoutM = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/login");
    },
  });

  return {
    me: meQuery.data,
    meLoading: meQuery.isLoading,
    meError: meQuery.isError,
    isAuthenticated: meQuery.status === "success",

    login: (args: LoginArgs) => loginM.mutateAsync(args),
    signup: (args: SignupArgs) => signupM.mutateAsync(args),
    logout: () => logoutM.mutateAsync(),

    loginM, signupM, logoutM,
  };
}
