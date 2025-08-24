// my-app/hooks/useAuth.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export type Me = { email: string; role?: string };

async function fetchMe(): Promise<Me> {
  const { data } = await api.get("/auth/me");
  return data;
}

export function useAuth() {
  const qc = useQueryClient();
  const router = useRouter();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  const loginM = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      router.replace("/chat");
    },
  });

  const signupM = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await api.post("/auth/signup", { email, password });
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

    login: (args: { email: string; password: string }) => loginM.mutateAsync(args),
    signup: (args: { email: string; password: string }) => signupM.mutateAsync(args),
    logout: () => logoutM.mutateAsync(),

    loginM, signupM, logoutM,
  };
}
