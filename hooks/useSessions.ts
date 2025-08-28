"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Session, SessionSummary, Message } from "@/types";

const ASK_PATH = "/ask";
const now = () => Date.now();

function dedupeMessages(arr: Message[]): Message[] {
  const seen = new Set<string>();
  const out: Message[] = [];
  for (const m of arr) {
    const k = String(m.id || "") || `${m.role}-${m.ts}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
  }
  return out;
}

export function useSessions() {
  const qc = useQueryClient();

  // ----- Active session persistence -----
  const [activeId, setActiveId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("activeSessionId") || undefined;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeId) localStorage.setItem("activeSessionId", activeId);
    else localStorage.removeItem("activeSessionId");
  }, [activeId]);

  // ----- Queries -----
  const listQ = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data } = await api.get("/sessions");
      const items = (data?.items || data?.sessions || data) ?? [];
      return items as SessionSummary[];
    },
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  const activeQ = useQuery({
    queryKey: ["session", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await api.get(`/sessions/${activeId}`);
      return data as Session;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });

  // ----- Mutations -----
  const createM = useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post("/sessions", { title });
      return data as Session;
    },
    onSuccess: (s) => {
      qc.setQueryData<SessionSummary[]>(["sessions"], (prev = []) => {
        const row: SessionSummary = { id: s.id, title: s.title, updatedAt: s.updatedAt };
        return [row, ...prev.filter((x) => x.id !== s.id)];
      });
      qc.setQueryData<Session>(["session", s.id], s);
    },
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sessions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<SessionSummary[]>(["sessions"], (prev = []) =>
        prev.filter((x) => x.id !== id)
      );
      qc.removeQueries({ queryKey: ["session", id], exact: true });
      if (activeId === id) setActiveId(undefined);
    },
  });

  const titleM = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data } = await api.patch(`/sessions/${id}`, { title });
      return data as Session;
    },
    onSuccess: (s) => {
      qc.setQueryData<SessionSummary[]>(["sessions"], (prev = []) =>
        prev.map((x) =>
          x.id === s.id ? { ...x, title: s.title, updatedAt: s.updatedAt } : x
        )
      );
      qc.setQueryData<Session>(["session", s.id], (prev) =>
        prev ? { ...prev, title: s.title, updatedAt: s.updatedAt } : prev
      );
    },
  });

  const sendM = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        ts: now(),
      };
      // optimistic user message
      qc.setQueryData<Session>(["session", id], (prev) => {
        if (!prev) return prev as any;
        const messages = [...(prev.messages || []), userMsg];
        return { ...prev, messages, updatedAt: now() };
      });

      const { data } = await api.post(ASK_PATH, { q: text, session_id: id });

      const sid: string = data.session_id || id;
      const aiMsg: Message = {
        id: data.message?.id || crypto.randomUUID(),
        role: (data.message?.role as Message["role"]) || "assistant",
        content: data.message?.content ?? "",
        ts: data.message?.ts ?? now(),
        references: data.message?.references ?? data.references ?? [],
      };
      const rightPane =
        data.rightPane ??
        data.right_pane ??
        (data.results || data.documents ? { results: data.results ?? data.documents } : undefined);

      return { sid, userMsg, aiMsg, rightPane };
    },
    onSuccess: ({ sid, userMsg, aiMsg, rightPane }) => {
      if (!activeId || activeId !== sid) setActiveId(sid);

      qc.setQueryData<Session>(["session", sid], (prev) => {
        const base: Session =
          prev ?? ({
            id: sid,
            title: "New chat",
            createdAt: now(),
            updatedAt: now(),
            messages: [],
          } as Session);

        const alreadyHasUser = (base.messages || []).some((m) => m.id === userMsg.id);
        const messages = alreadyHasUser
          ? [...base.messages, aiMsg] // only add AI if user was optimistically added
          : [...base.messages, userMsg, aiMsg];

        return {
          ...base,
          messages,
          updatedAt: now(),
          rightPane: rightPane ?? base.rightPane,
        };
      });

      qc.setQueryData<SessionSummary[]>(["sessions"], (prev = []) => {
        const existing = prev.find((x) => x.id === sid);
        const row: SessionSummary = { id: sid, title: existing?.title || "New chat", updatedAt: now() };
        return [row, ...prev.filter((x) => x.id !== sid)];
      });
    },
  });


  return { listQ, activeQ, activeId, setActiveId, createM, deleteM, titleM, sendM };
}
