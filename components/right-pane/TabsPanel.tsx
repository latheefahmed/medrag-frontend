"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import type { RightPaneData } from "@/types";

const copy = (t: string) => navigator.clipboard?.writeText(t).catch(() => {});

export default function TabsPanel({ data }: { data?: RightPaneData }) {
  const results = (data?.results ?? []).filter(Boolean);

  // de-dupe by pmid/url/title
  const uniq: typeof results = [];
  const seen = new Set<string>();
  for (const d of results) {
    const key = `${d.pmid ?? ""}|${d.url ?? ""}|${d.title ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(d);
  }

  return (
    <Card className="h-full">
      <CardContent className="p-3 h-full">
        <h2 className="font-semibold text-base mb-3">References</h2>

        <ScrollArea className="h-[calc(100dvh-200px)] pr-1">
          <div className="space-y-4">
            {uniq.map((d, i) => {
              const url = d.url || (d.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${d.pmid}/` : undefined);
              return (
                <div key={`${d.pmid ?? d.url ?? i}`} className="rounded-md p-3 hover:bg-zinc-50">
                  {url ? (
                    <a className="font-medium text-[15px] leading-6 underline" href={url} target="_blank" rel="noreferrer">
                      {d.title}
                    </a>
                  ) : (
                    <div className="font-medium text-[15px] leading-6">{d.title}</div>
                  )}
                  <div className="text-xs text-zinc-600 mt-1">
                    {d.journal || ""}{d.year ? ` • ${d.year}` : ""}{d.pmid ? ` • PMID ${d.pmid}` : ""}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {d.pmid && (
                      <Button variant="outline" size="xs" onClick={() => copy(String(d.pmid))}>
                        <Copy className="h-3 w-3 mr-1" /> Copy PMID
                      </Button>
                    )}
                    {url && (
                      <a className="text-xs inline-flex items-center gap-1 underline" href={url} target="_blank" rel="noreferrer">
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
