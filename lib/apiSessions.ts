// my-app/lib/apiSessions.ts
import { api } from "@/lib/api";

/* ---------------------------- Types ---------------------------- */
export type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number; // epoch ms
};

export type RightPane = {
  ranked?: any[];
  overview?: string;
  booleans?: string[];
  evidence?: any[];
};

export type Session = {
  id: string;
  title: string;
  messages: Msg[];
  rightPane?: RightPane;
};

/* ------------------------ Normalization ------------------------ */
function normalizeMsg(m: any): Msg {
  const ts =
    typeof m?.ts === "number"
      ? m.ts
      : (m?.ts && !Number.isNaN(Date.parse(m.ts))) ? Date.parse(m.ts) : Date.now();

  return {
    id: String(m?.id ?? `${m?.role ?? "user"}-${ts}`),
    role: (m?.role ?? "user") as Msg["role"],
    content: String(m?.content ?? ""),
    ts,
  };
}

function normalizeSession(payload: any): Session {
  const s = payload?.session ?? payload ?? {};
  return {
    id: String(s.id),
    title: String(s.title ?? "Untitled"),
    messages: Array.isArray(s.messages) ? s.messages.map(normalizeMsg) : [],
    rightPane: s.rightPane ?? s.right_pane ?? undefined,
  };
}

/* --------------------------- API --------------------------------
   Backend endpoints (as per your FastAPI app):
   - GET    /sessions
   - POST   /sessions        { title }
   - GET    /sessions/{id}
   - PATCH  /sessions/{id}   { title? }
   - DELETE /sessions/{id}
   - POST   /ask             { session_id, text }  -> returns updated session
------------------------------------------------------------------- */

export async function listSessions(): Promise<Session[]> {
  const { data } = await api.get("/sessions");
  const arr = Array.isArray(data) ? data : data?.sessions ?? [];
  return arr.map(normalizeSession);
}

export async function createSession(title: string): Promise<Session> {
  const { data } = await api.post("/sessions", { title });
  return normalizeSession(data);
}

export async function getSession(id: string): Promise<Session> {
  const { data } = await api.get(`/sessions/${encodeURIComponent(id)}`);
  return normalizeSession(data);
}

export async function patchSession(
  id: string,
  patch: Partial<Pick<Session, "title">>
): Promise<Session> {
  const { data } = await api.patch(`/sessions/${encodeURIComponent(id)}`, patch);
  return normalizeSession(data);
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/sessions/${encodeURIComponent(id)}`);
}

// lib/apiSessions.ts
export async function sendMessage(id: string, text: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/ask`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: id, text }), // <-- MUST match AskIn
  });

  if (!res.ok) {
    // surface FastAPI validation details
    let detail: any = null;
    try { detail = await res.json(); } catch { detail = await res.text(); }
    throw new Error(`POST /ask ${res.status}: ${JSON.stringify(detail)}`);
  }

  return (await res.json()) as import("@/types").Session;
}

// lib/apiSessions.ts (add this export)
export async function renameSession(id: string, title: string): Promise<import("@/types").Session> {
  // Example PATCH; use PUT if your API prefers
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/sessions/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Rename failed: ${res.status}`);
  return await res.json();
}
