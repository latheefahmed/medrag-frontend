"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Composer({
  onSend,
  disabled,
  onFocus,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  onFocus?: () => void;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [text]);

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    ref.current?.focus();
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 rounded-md border bg-white px-3 py-2">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          aria-label="Chat message"
          disabled={!!disabled}
          placeholder="Type your question…"
          onFocus={() => onFocus?.()}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className={cn(
            "w-full resize-none outline-none text-sm leading-6 placeholder:text-zinc-400",
            "max-h-40"
          )}
        />
        <div className="mt-1 text-[10px] text-zinc-500">Shift+Enter for newline</div>
      </div>
      <Button onClick={submit} disabled={disabled || !text.trim()}>
        Send
      </Button>
    </div>
  );
}
