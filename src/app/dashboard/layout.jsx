"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <LayoutInterno>{children}</LayoutInterno>
    </ThemeProvider>
  );
}

function LayoutInterno({ children }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { tema } = useTheme(); // <-- Agora o layout também acessa o tema

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn !== "true") {
      router.replace("/acesso-restrito");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Verificando acesso...</p>
      </div>
    );
  }

  const bgClass = tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";

  return (
    <div className={`flex h-screen ${bgClass}`}>
      <Sidebar handleLogout={handleLogout} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
