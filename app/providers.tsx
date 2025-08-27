"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { Message } from "@/types";

type SelectedCtx = {
  selectedMessage?: Message;
  setSelectedMessage: (m?: Message) => void;
  clearSelected: () => void;
};

const SelectedMessageContext = createContext<SelectedCtx>({
  setSelectedMessage: () => {},
  clearSelected: () => {},
});

export function useSelectedMessage() {
  return useContext(SelectedMessageContext);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(undefined);

  const value = useMemo<SelectedCtx>(
    () => ({
      selectedMessage,
      setSelectedMessage,
      clearSelected: () => setSelectedMessage(undefined),
    }),
    [selectedMessage]
  );

  return (
    <QueryClientProvider client={client}>
      <SelectedMessageContext.Provider value={value}>
        {children}
      </SelectedMessageContext.Provider>
    </QueryClientProvider>
  );
}
