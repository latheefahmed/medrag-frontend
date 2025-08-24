// types.ts (replace contents with this; adjust imports if you keep other types elsewhere)

export type Role =
  | "student"
  | "researcher"
  | "data-analyst"
  | "doctor"
  | "clinician"
  | "admin";

export type User = {
  user_id: string;
  email: string;
  roles: Role[];
  profile?: { name?: string; purpose?: Role };
};

export type AuthMe = { ok: boolean; user: User | null };

export type LoginInput = { email: string; password: string };
export type SignupInput = { name?: string; email: string; password: string; purpose: Role };

export type MsgRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: MsgRole;
  content: string;
  ts?: number; // keep optional; UI tolerates missing ts
};

// ---- Right pane rich model ----
export type RankedDoc = {
  pmid: string;
  title: string;
  journal?: string;
  year?: number;
  score?: number;
  url?: string;
  abstract?: string;
};

export type BooleanItem = { group: string; query: string; note?: string };

export type EvidenceItem = {
  n?: number;
  pmid: string;
  year?: number;
  journal?: string;
  title: string;
  snippet?: string;
};

export type Overview = {
  conclusion: string;
  key_findings: string[];
  quality_and_limits?: string[];
};

export type PlanLite = { chunks?: string[]; time_tags?: string[]; exclusions?: string[] };

export type RightPaneData = {
  results: RankedDoc[];
  booleans: BooleanItem[];
  evidence?: EvidenceItem[];
  overview?: Overview;
  plan?: PlanLite;
};

// ---- Sessions ----
export type Session = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  rightPane?: RightPaneData | any; // backend variations; page.tsx normalizes
};

export type SessionSummary = Pick<Session, "id" | "title" | "updatedAt">;
