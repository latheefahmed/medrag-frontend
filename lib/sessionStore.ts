import type { Message, Session, SessionSummary, RightPaneData } from "@/types";

const SESS_KEY = "medrag_sessions";
const ACTIVE_KEY = "medrag_active";
const uid = () => `s_${Math.random().toString(36).slice(2)}${Date.now()}`;

function readAll(): Session[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SESS_KEY);
  return raw ? (JSON.parse(raw) as Session[]) : [];
}
function writeAll(sessions: Session[]) {
  localStorage.setItem(SESS_KEY, JSON.stringify(sessions));
}

export function listSessions(): SessionSummary[] {
  return readAll()
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}
export function setActiveId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function getSession(id: string): Session | null {
  return readAll().find((s) => s.id === id) ?? null;
}

export function createSession(firstTitle?: string): Session {
  const now = Date.now();
  const s: Session = {
    id: uid(),
    title: firstTitle?.trim() || "New session",
    createdAt: now,
    updatedAt: now,
    messages: []
  };
  const all = readAll();
  all.push(s);
  writeAll(all);
  setActiveId(s.id);
  return s;
}

export function renameSession(id: string, title: string) {
  const all = readAll();
  const s = all.find((x) => x.id === id);
  if (!s) return;
  s.title = title.trim() || s.title;
  s.updatedAt = Date.now();
  writeAll(all);
}

export function deleteSession(id: string) {
  const all = readAll().filter((x) => x.id !== id);
  writeAll(all);
  if (getActiveId() === id) setActiveId(all[0]?.id || null);
}

export function appendMessage(id: string, msg: Message) {
  const all = readAll();
  const s = all.find((x) => x.id === id);
  if (!s) return;
  s.messages.push(msg);
  s.updatedAt = Date.now();
  writeAll(all);
}

export function saveRightPane(id: string, data: RightPaneData) {
  const all = readAll();
  const s = all.find((x) => x.id === id);
  if (!s) return;
  s.rightPane = data;
  s.updatedAt = Date.now();
  writeAll(all);
}

/** Local "send" that mocks the backend. Swap this to a real /ask call later. */
export async function sendMessageLocal(id: string, userText: string) {
  // 1) user message
  appendMessage(id, { id: `m_${crypto.randomUUID()}`, role: "user", content: userText, ts: Date.now() });

  // 2) assistant placeholder + right-pane stub
  const assistant = `Thanks! I received: “${userText}”.\n\n(🔧 Local dev mode—replace with FastAPI /ask response.)`;
  appendMessage(id, { id: `m_${crypto.randomUUID()}`, role: "assistant", content: assistant, ts: Date.now() });

  const demoDocs: RightPaneData = {
    results: [
      { pmid: "37999999", title: "Example trial on therapy X for condition Y", journal: "NEJM", year: 2024, url: "https://pubmed.ncbi.nlm.nih.gov/37999999/", score: 0.92 },
      { pmid: "36888888", title: "Meta-analysis of Z in adults", journal: "Lancet", year: 2023, url: "https://pubmed.ncbi.nlm.nih.gov/36888888/", score: 0.87 }
    ],
    overview: "This is an AI overview placeholder generated locally. It will summarize top evidence returned by FastAPI.",
    booleans: ['("myocardial infarction"[Title/Abstract]) AND ("aspirin"[Title/Abstract])'],
    evidencePack: "[1] PMID 37999999 — Example trial...\n[2] PMID 36888888 — Meta-analysis..."
  };
  saveRightPane(id, demoDocs);
}
