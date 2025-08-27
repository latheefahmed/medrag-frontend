"use client";

import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Session,
  SessionSummary,
  Message,
} from "@/types";

const ASK_PATH = "/ask"; // change if your backend uses another route

const now = () => Date.now();

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
      // Accept several shapes: {items: [...]}, {sessions: [...]}, or [...]
      const items = (data?.items || data?.sessions || data) ?? [];
      return items as SessionSummary[];
    },
    staleTime: 10_000,
  });

  const activeQ = useQuery({
    queryKey: ["session", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data } = await api.get(`/sessions/${activeId}`);
      return data as Session;
    },
  });

  // ----- Mutations -----
  const createM = useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post("/sessions", { title });
      const s = data as Session;
      return s;
    },
    onSuccess: (s) => {
      // seed caches
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
      // 1) optimistic user message into cache
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        ts: now(),
      };
      qc.setQueryData<Session>(["session", id], (prev) => {
        if (!prev) return prev as any;
        const messages = [...(prev.messages || []), userMsg];
        return { ...prev, messages, updatedAt: now() };
      });

      // 2) ask backend (it should also persist messages in Cosmos)
      const { data } = await api.post(ASK_PATH, { q: text, session_id: id });

      // expected response (tolerant):
      // {
      //   session_id: string;
      //   message: { id, role, content, ts?, references? };
      //   rightPane? | right_pane? | results? | documents?
      // }
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
        (data.results || data.documents
          ? { results: data.results ?? data.documents }
          : undefined);

      return { sid, userMsg, aiMsg, rightPane };
    },
    onSuccess: ({ sid, userMsg, aiMsg, rightPane }) => {
      // ensure active session matches server session
      if (!activeId || activeId !== sid) setActiveId(sid);

      // merge returned AI message + right pane into cache
      qc.setQueryData<Session>(["session", sid], (prev) => {
        const base: Session =
          prev ??
          ({
            id: sid,
            title: "New chat",
            createdAt: now(),
            updatedAt: now(),
            messages: [],
          } as Session);

        const messages = [...(base.messages || []), userMsg, aiMsg];

        return {
          ...base,
          messages,
          updatedAt: now(),
          rightPane: rightPane ?? base.rightPane,
        };
      });

      // bump session to the top of the list
      qc.setQueryData<SessionSummary[]>(["sessions"], (prev = []) => {
        const existing = prev.find((x) => x.id === sid);
        const row: SessionSummary = {
          id: sid,
          title: existing?.title || "New chat",
          updatedAt: now(),
        };
        return [row, ...prev.filter((x) => x.id !== sid)];
      });
    },
  });

  return {
    listQ,
    activeQ,
    activeId,
    setActiveId,
    createM,
    deleteM,
    titleM,
    sendM,
  };
}
