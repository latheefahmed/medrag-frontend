"use client";

export default function TypingBubble() {
  return (
    <div className="flex gap-2 items-end max-w-[68ch] mr-auto">
      <div className="rounded-3xl px-4 py-3 bg-neutral-900 text-neutral-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-85">Searching</span>
          <span className="flex gap-1">
            <i className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-bounce [animation-delay:-300ms]" />
            <i className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-bounce [animation-delay:-150ms]" />
            <i className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-bounce" />
          </span>
        </div>
      </div>
    </div>
  );
}
