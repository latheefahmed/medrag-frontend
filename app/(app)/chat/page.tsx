"use client";

import { useEffect, useMemo } from "react";
import { useSessions } from "@/hooks/useSessions";
import { Card, CardContent } from "@/components/ui/card";
import MessageList from "@/components/chat/MessageList";
import Composer from "@/components/chat/Composer";
import type { RightPaneData } from "@/types";
import TabsPanel from "@/components/right-pane/TabsPanel";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type AnyRec = Record<string, any>;

function normalizeRightPane(session: AnyRec | undefined): RightPaneData {
  const rp: AnyRec = session?.rightPane ?? session ?? {};
  const raw = rp.results ?? rp.final_docs ?? rp.documents ?? [];
  const results = (raw as AnyRec[])
    .map((d) => ({
      pmid: String(d.pmid ?? d.id ?? ""),
      title: String(d.title ?? ""),
      journal: d.journal ?? d.source ?? "",
      year: d.year ?? (typeof d.pubYear === "number" ? d.pubYear : undefined),
      score:
        typeof d.score === "number"
          ? d.score
          : typeof d.fused_raw === "number"
          ? d.fused_raw
          : undefined,
      url: d.url ?? (d.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${d.pmid}/` : undefined),
      abstract: d.abstract ?? "",
    }))
    .filter((d) => d.title || d.pmid)
    .sort((a, b) => ((b.score ?? -1) - (a.score ?? -1)) || ((b.year ?? 0) - (a.year ?? 0)));

  const bb = rp.booleans ?? rp.buckets ?? [];
  const booleans =
    Array.isArray(bb) && typeof bb[0] === "string"
      ? (bb as string[]).map((q) => ({ group: "", query: q, note: "" }))
      : (bb as AnyRec[]).map((b) => ({
          group: String(b.group ?? b.chunk ?? ""),
          query: String(b.query ?? b.boolean ?? ""),
          note: b.note ?? "",
        }));

  const overview =
    rp.overview ??
    (rp.summary?.answer && {
      conclusion: rp.summary.answer.conclusion ?? "",
      key_findings: rp.summary.answer.key_findings ?? [],
      quality_and_limits: rp.summary.answer.quality_and_limits ?? [],
    });

  const evidence =
    rp.evidence ??
    (Array.isArray(raw)
      ? raw.slice(0, 20).map((d: AnyRec, i: number) => ({
          n: i + 1,
          pmid: String(d.pmid ?? ""),
          year: d.year,
          journal: d.journal ?? "",
          title: String(d.title ?? ""),
          snippet: (d.abstract ?? "").slice(0, 320),
        }))
      : []);

  const plan =
    rp.plan ?? { chunks: rp.chunks ?? [], time_tags: rp.time_tags ?? [], exclusions: rp.exclusions ?? [] };

  return { results, booleans, overview, evidence, plan };
}

export default function ChatPage() {
  const { listQ, activeQ, activeId, setActiveId, createM, deleteM, titleM, sendM } =
    useSessions();

  useEffect(() => {
    if (!activeId && listQ.data?.length) setActiveId(listQ.data[0].id);
  }, [activeId, listQ.data, setActiveId]);

  const sessions = listQ.data ?? [];
  const messages = activeQ.data?.messages ?? [];
  const paneData: RightPaneData = useMemo(
    () => normalizeRightPane(activeQ.data),
    [activeQ.data]
  );

  const ensureActive = async () => {
    if (activeId) return activeId;
    if (listQ.data?.length) {
      setActiveId(listQ.data[0].id);
      return listQ.data[0].id;
    }
    const created = await createM.mutateAsync("New chat");
    setActiveId(created.id);
    return created.id;
  };

  const onSend = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    const id = await ensureActive();
    sendM.mutate({ id, text: t });
  };


  const LEFT = "clamp(10rem, 13vw, 12rem)";
  const CENTER = "minmax(900px, 1fr)";
  const RIGHT = "clamp(18rem, 22vw, 22rem)";
  const STICKY_TOP = 64; 

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-zinc-50 via-zinc-50 to-zinc-100">
      <div
        className="mx-auto max-w-[1700px] px-5 py-5 grid gap-5"
        style={{ gridTemplateColumns: `${LEFT} ${CENTER} ${RIGHT}` }}
      >
        {}
        <aside>
          <div style={{ position: "sticky", top: STICKY_TOP }}>
            <Card className="bg-white/95 shadow-sm ring-1 ring-black/5 rounded-2xl">
              <CardContent className="p-4 space-y-3 h-[calc(100dvh-96px)] overflow-auto overscroll-contain">
                <div className="flex items-center gap-2">
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="New chat"
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        createM.mutate((e.target as HTMLInputElement).value || "Untitled");
                    }}
                  />
                  <Button size="sm" onClick={() => createM.mutate("New chat")}>
                    New
                  </Button>
                </div>

                <div className="space-y-1">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center rounded-md border pl-2 pr-1 py-1 text-sm ${
                        s.id === activeId ? "bg-zinc-50" : "bg-white"
                      }`}
                    >
                      <button
                        className="truncate text-left flex-1"
                        onClick={() => setActiveId(s.id)}
                        title={s.title}
                      >
                        {s.title || "Untitled"}
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-zinc-100" aria-label="Session actions">
                            <MoreVertical className="h-4 w-4 text-zinc-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() =>
                              titleM?.mutate?.({ id: s.id, title: prompt("Rename", s.title) || s.title })
                            }
                          >
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteM.mutate(s.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                  {!sessions.length && (
                    <p className="text-xs text-zinc-500">Your past chats will appear here.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* CENTER (only this scrolls for messages) */}
        <section className="min-w-0">
          <div style={{ position: "sticky", top: STICKY_TOP }}>
            <Card className="bg-white shadow-md ring-1 ring-black/5 rounded-3xl overflow-hidden">
              <CardContent className="p-0 h-[calc(100dvh-96px)] flex flex-col">
                <div className="flex-1 min-h-0">
                  <MessageList messages={messages} isLoading={!!sendM.isPending} />
                </div>
                <div className="border-t p-4 bg-white/85 backdrop-blur-sm">
                  <Composer onSend={onSend} disabled={sendM.isPending} onFocus={ensureActive} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* RIGHT (references scroll independently) */}
        <aside>
          <div style={{ position: "sticky", top: STICKY_TOP }}>
            <Card className="bg-white/95 shadow-sm ring-1 ring-black/5 rounded-3xl overflow-hidden">
              <CardContent className="p-0 h-[calc(100dvh-96px)] overflow-auto overscroll-contain">
                <div className="h-full p-3">
                  <TabsPanel data={paneData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
