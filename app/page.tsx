// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // choose what you want to land on by default:
  redirect("/login"); // or redirect("/chat")
}
