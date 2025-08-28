import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080",
  withCredentials: true,
  timeout: 30000,
});

// ---- existing helpers left intact ----

export async function postResendVerification() {
  const { data } = await api.post("/auth/resend-verification");
  return data;
}

// Admin helpers (will 403 until backend exists)
export async function getAdminUsers(params?: Record<string, any>) {
  const { data } = await api.get("/admin/users", { params });
  return data;
}
export async function getAdminSessions(params?: Record<string, any>) {
  const { data } = await api.get("/admin/sessions", { params });
  return data;
}
export async function getAdminUsage(params?: Record<string, any>) {
  const { data } = await api.get("/admin/usage", { params });
  return data;
}
