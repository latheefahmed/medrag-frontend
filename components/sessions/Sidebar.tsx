"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSessions } from "@/hooks/useSessions";

/**
 * Polished sessions list.
 * Works with your existing hook shape:
 *   const { sessionsQ, activeQ, createM, selectM } = useSessions();
 * If your hook also exposes titleM/deleteM, we auto-enable Rename/Delete.
 */
export default function Sidebar() {
  const sess = useSessions() as any;
  const { sessionsQ, activeQ, createM, selectM } = sess;
  const titleM = (sess.titleM as { mutate: (p: { id: string; title: string }) => void }) || null;
  const deleteM = (sess.deleteM as { mutate: (id: string) => void }) || null;

  const [q, setQ] = useState("");
  const [quickTitle, setQuickTitle] = useState("");

  const activeId: string | null = activeQ?.data?.id ?? null;
  const items = sessionsQ?.data ?? [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s: any) =>
      (s.title || "untitled").toLowerCase().includes(term)
    );
  }, [items, q]);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Sessions</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createM?.mutate(quickTitle || "Untitled")}
          >
            New
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="New title"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
          />
        </div>

        <Input
          placeholder="Search sessions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-2"
        />

        <ScrollArea className="h-[60vh] pr-1">
          <div className="space-y-1">
            {filtered.map((s: any) => (
              <div
                key={s.id}
                className={cn(
                  "group rounded-md border px-3 py-2 text-sm flex items-start gap-2",
                  activeId === s.id ? "bg-zinc-100" : "bg-white hover:bg-zinc-50"
                )}
              >
                <button
                  onClick={() => selectM?.mutate(s.id)}
                  className="truncate text-left flex-1"
                  title={s.title}
                >
                  {s.title || "Untitled"}
                  <div className="text-[10px] text-zinc-500">
                    {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : ""}
                  </div>
                </button>

                {/* Hover actions (only visible if your hook provides them) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {titleM && (
                    <button
                      className="rounded border px-1 text-[10px]"
                      onClick={() =>
                        titleM.mutate({
                          id: s.id,
                          title: prompt("Rename", s.title) || s.title,
                        })
                      }
                    >
                      Rename
                    </button>
                  )}
                  {deleteM && (
                    <button
                      className="rounded border px-1 text-[10px] text-red-600"
                      onClick={() => deleteM.mutate(s.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="text-sm text-zinc-600">No sessions.</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
