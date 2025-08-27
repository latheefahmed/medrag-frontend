import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080",
  withCredentials: true,
  timeout: 30000,
});

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data as import("@/types").AuthMe;
}
export async function postLogin(body: import("@/types").LoginInput) {
  const { data } = await api.post("/auth/login", body);
  return data;
}
export async function postSignup(body: import("@/types").SignupInput) {
  const { data } = await api.post("/auth/signup", body);
  return data;
}
export async function postLogout() {
  const { data } = await api.post("/auth/logout");
  return data;
}
