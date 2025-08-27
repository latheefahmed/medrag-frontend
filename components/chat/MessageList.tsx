"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import TypingBubble from "./TypingBubble";
import { useSelectedMessage } from "@/app/providers";

export default function MessageList({
  messages,
  isLoading,
}: {
  messages: Message[];
  isLoading?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { setSelectedMessage } = useSelectedMessage();

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-auto">
      <div className="min-h-full flex flex-col justify-end gap-4 p-6">
        {!messages.length && !isLoading && (
          <div className="text-sm text-zinc-500">Start by asking a question…</div>
        )}

        {messages.map((m) => {
          const isAI = m.role !== "user";
          const bubble = (
            <div
              key={m.id}
              className={cn(
                "max-w-[68ch] rounded-3xl px-4 py-3 text-base leading-7 shadow-sm",
                m.role === "user"
                  ? "ml-auto bg-zinc-100"
                  : "mr-auto bg-white border border-zinc-200 hover:shadow-md"
              )}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.ts && (
                <div className="mt-1 text-[11px] text-zinc-500 text-right">
                  {new Date(m.ts).toLocaleTimeString()}
                </div>
              )}
              {isAI && !!m.references?.length && (
                <div className="mt-1 text-[11px] text-zinc-600 underline">
                  {m.references.length} reference{m.references.length > 1 ? "s" : ""} • click to view →
                </div>
              )}
            </div>
          );

          return isAI ? (
            <button
              key={m.id}
              onClick={() => setSelectedMessage(m)}
              className="text-left mr-auto max-w-fit cursor-pointer"
              title={m.references?.length ? "View references" : "Answer"}
            >
              {bubble}
            </button>
          ) : (
            bubble
          );
        })}

        {isLoading && <TypingBubble />}
      </div>
    </div>
  );
}
