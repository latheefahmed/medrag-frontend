// lib/useSessions.ts
import { type Session, type Msg, sendMessage } from "@/lib/apiSessions";

/** Always create a fully-typed user message (id + ts included). */
export function makeUserMsg(content: string): Msg {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

  return {
    id,
    role: "user",
    content,
    ts: Date.now(),
  };
}

/** Pure helper: returns a *new* session with the message appended. */
export function withAppendedMessage(session: Session, msg: Msg): Session {
  return {
    ...session,
    messages: [...(session.messages ?? []), msg],
  };
}

/** Send to backend; if it fails, return optimistic local session so UI still renders. */
export async function sendAndRefresh(session: Session, text: string): Promise<Session> {
  const optimistic = withAppendedMessage(session, makeUserMsg(text));
  try {
    // FastAPI should return the updated session (incl. assistant reply)
    const updated = await sendMessage(session.id, text);
    return updated;
  } catch {
    return optimistic;
  }
}
