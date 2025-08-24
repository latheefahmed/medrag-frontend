"use client";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/types";

const colors: Record<Role, string> = {
  student: "bg-blue-100 text-blue-800",
  researcher: "bg-purple-100 text-purple-800",
  "data-analyst": "bg-amber-100 text-amber-800",
  doctor: "bg-rose-100 text-rose-800",
  clinician: "bg-emerald-100 text-emerald-800",
  admin: "bg-zinc-900 text-white"
};

export default function RoleBadge({ role }: { role: Role }) {
  return <Badge className={`${colors[role]} capitalize`}>{role.replace("-", " ")}</Badge>;
}
