"use client";

type Role =
  | "student"
  | "researcher"
  | "data_analyst"
  | "doctor"
  | "clinician"
  | "admin"
  | string;

const label: Record<string, string> = {
  student: "Student",
  researcher: "Researcher",
  data_analyst: "Data analyst",
  doctor: "Doctor",
  clinician: "Clinician",
  admin: "Admin",
};

export default function RoleBadge({ role }: { role: Role }) {
  const c =
    role === "admin"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : role === "doctor" || role === "clinician"
      ? "bg-emerald-100 text-emerald-900 border-emerald-200"
      : role === "researcher"
      ? "bg-indigo-100 text-indigo-900 border-indigo-200"
      : role === "data_analyst"
      ? "bg-sky-100 text-sky-900 border-sky-200"
      : "bg-zinc-100 text-zinc-900 border-zinc-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-[2px] text-xs ${c}`}>
      {label[role] ?? role}
    </span>
  );
}
