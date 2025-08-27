"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import type { RightPaneData } from "@/types";
import { useSelectedMessage } from "@/app/providers";

const copy = (t: string) => navigator.clipboard?.writeText(t).catch(() => {});

export default function TabsPanel({ data }: { data?: RightPaneData }) {
  const { selectedMessage } = useSelectedMessage();

  // Prefer references from the selected AI message (if present); fall back to pane data.
  const fromSelected =
    selectedMessage?.references?.map((r) => ({
      pmid: r.pmid ?? "",
      title: r.title,
      journal: r.journal,
      year: r.year,
      score: r.score,
      url: r.url || (r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : undefined),
      abstract: r.abstract,
    })) ?? [];

  const base = (data?.results ?? []).filter(Boolean);
  const results = (fromSelected.length ? fromSelected : base) as NonNullable<
    RightPaneData["results"]
  >;

  // de-dupe by pmid/url/title
  const uniq: typeof results = [];
  const seen = new Set<string>();
  for (const d of results) {
    const key = `${d.pmid ?? ""}|${d.url ?? ""}|${d.title ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(d);
  }

  const usingSelected = fromSelected.length > 0;

  return (
    <Card className="h-full">
      <CardContent className="p-3 h-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">
            {usingSelected ? "References for selected answer" : "References"}
          </h2>
          {usingSelected && (
            <div className="text-xs text-zinc-500">Click a different AI message to switch.</div>
          )}
        </div>

        <ScrollArea className="h-[calc(100dvh-200px)] pr-1">
          <div className="space-y-4">
            {uniq.map((d, i) => {
              const url =
                d.url || (d.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${d.pmid}/` : undefined);
              return (
                <div key={`${d.pmid ?? d.url ?? i}`} className="rounded-md p-3 hover:bg-zinc-50">
                  {url ? (
                    <a
                      className="font-medium text-[15px] leading-6 underline"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {d.title}
                    </a>
                  ) : (
                    <div className="font-medium text-[15px] leading-6">{d.title}</div>
                  )}
                  <div className="text-xs text-zinc-600 mt-1">
                    {d.journal || ""}
                    {d.year ? ` • ${d.year}` : ""}
                    {d.pmid ? ` • PMID ${d.pmid}` : ""}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {d.pmid && (
                      <Button variant="outline" size="sm" onClick={() => copy(String(d.pmid))}>
                        <Copy className="h-3 w-3 mr-1" /> Copy PMID
                      </Button>
                    )}
                    {url && (
                      <a
                        className="text-xs inline-flex items-center gap-1 underline"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" /> Open
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            {!uniq.length && <div className="text-sm text-zinc-500">No references yet.</div>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
