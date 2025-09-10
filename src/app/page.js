import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // sempre vai mandar para login
}
