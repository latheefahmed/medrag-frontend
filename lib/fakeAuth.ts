// lib/fakeAuth.ts
export type FakeUser = {
  user_id: string;
  email: string;
  roles: string[];
  profile?: { name?: string; purpose?: string };
};

const KEY = "medrag_user";

const uid = () => `u_${Math.random().toString(36).slice(2)}${Date.now()}`;

function read(): FakeUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as FakeUser) : null;
}
function write(u: FakeUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
}

export async function fakeGetMe() {
  const user = read();
  return { ok: !!user, user };
}

export async function fakeSignup(body: { email: string; password: string; name?: string; purpose: string }) {
  const baseRole = body.purpose as FakeUser["roles"][number];
  const user: FakeUser = {
    user_id: uid(),
    email: body.email,
    roles: [baseRole], // you can add more later (e.g., "admin")
    profile: { name: body.name, purpose: baseRole }
  };
  write(user);
  return { ok: true };
}

export async function fakeLogin(body: { email: string; password: string }) {
  // accept anything in dev
  const existing = read();
  const user: FakeUser =
    existing?.email === body.email
      ? existing
      : { user_id: uid(), email: body.email, roles: ["student"], profile: { purpose: "student" } };
  write(user);
  return { ok: true };
}

export async function fakeLogout() {
  write(null);
  return { ok: true };
}
