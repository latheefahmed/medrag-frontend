// hooks/useSessions.ts
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listSessions,
  createSession,
  getSession,
  deleteSession,
  sendMessage,
  // ⬇️ add:
  renameSession,
  type Session,
} from "@/lib/apiSessions";
import { makeUserMsg, withAppendedMessage } from "@/lib/useSessions";

export function useSessions() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const listQ = useQuery({ queryKey: ["sessions"], queryFn: listSessions });

  useEffect(() => {
    if (!activeId && listQ.data && listQ.data.length > 0) {
      setActiveId(listQ.data[0].id);
    }
  }, [activeId, listQ.data]);

  const activeQ = useQuery({
    queryKey: ["session", activeId],
    queryFn: () => getSession(activeId!),
    enabled: !!activeId,
  });

  const createM = useMutation({
    mutationFn: (title: string) => createSession(title),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setActiveId(s.id);
    },
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setActiveId(null);
    },
  });

  // ⬇️ NEW: rename
  const titleM = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameSession(id, title),
    onSuccess: (updated) => {
      qc.setQueryData(["session", updated.id], updated);
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const sendM = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const current: Session = await getSession(id);
      const optimistic = withAppendedMessage(current, makeUserMsg(text));
      qc.setQueryData(["session", id], optimistic);
      const updated = await sendMessage(id, text);
      return updated;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["session", updated.id], updated);
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  return {
    listQ,
    activeQ,
    activeId,
    setActiveId,
    createM,
    deleteM,
    sendM,
    // ⬇️ expose rename
    titleM,
  };
}
