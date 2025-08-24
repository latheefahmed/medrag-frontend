"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { cn } from "@/lib/utils";

export default function MessageList({ messages }: { messages: Message[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div ref={scrollerRef} className="h-full w-full overflow-auto">
      {/* The magic: min-h-full + justify-end keeps the stack at the bottom */}
      <div className="min-h-full flex flex-col justify-end gap-4 p-6">
        {!messages.length && (
          <div className="text-sm text-zinc-500">Start by asking a question…</div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[68ch] rounded-3xl px-4 py-3 text-base leading-7 shadow-sm",
              m.role === "user"
                ? "ml-auto bg-zinc-100"
                : "mr-auto bg-white border border-zinc-200"
            )}
          >
            <div className="whitespace-pre-wrap">{m.content}</div>
            {m.ts && (
              <div className="mt-1 text-[11px] text-zinc-500 text-right">
                {new Date(m.ts).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
