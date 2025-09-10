"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Truck, Home, Box, BarChart, Settings, Sun, Moon, Repeat } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ handleLogout }) {
  const router = useRouter();
  const { tema, toggleTema } = useTheme();
  const [open, setOpen] = useState(true);

  const sidebarBg = tema === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black";
  const sidebarBorder = tema === "dark" ? "border-gray-700" : "border-gray-200";
  const logoutBg = tema === "dark" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-black";

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { name: "Produtos", icon: <Box size={20} />, path: "/dashboard/produtos" },
    { name: "Movimentações", icon: <Repeat size={20} />, path: "/dashboard/movimentacoes" },
    { name: "Relatórios", icon: <BarChart size={20} />, path: "/dashboard/relatorios" },
    { name: "Configurações", icon: <Settings size={20} />, path: "/dashboard/configuracoes" },
  ];

  return (
    <motion.div
      animate={{ width: open ? 64 * 4 : 16 * 4 }}
      className={`h-screen flex flex-col justify-between p-4 ${sidebarBg} border-r-2 ${sidebarBorder} relative`}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      {/* Toggle da Sidebar */}
      <button
        onClick={() => setOpen(!open)}
        className={`absolute top-4 right-[-26px]  w-12 h-12 rounded-full flex items-center justify-center z-10 hover:brightness-90 transition-all ${tema === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}
      >
        {open ? "<" : ">"}
      </button>

      {/* Topo: logo */}
      <div className="flex items-center gap-2 mb-6">
        {open ? (
          <h2 className="text-xl font-bold">DashImportados</h2>
        ) : (
          <Truck size={28} />
        )}
      </div>

      {/* Menu */}
      <ul className="flex-1 space-y-4">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className="cursor-pointer hover:text-gray-400 flex items-center gap-2"
            onClick={() => router.push(item.path)}
          >
            {item.icon}
            {open && <span>{item.name}</span>}
          </li>
        ))}
      </ul>

      {/* Botões */}
      <div className="flex flex-col gap-3">
        <div className={open ? "border-t-4 rounded-3xl mb-4" : ""}></div>

        {/* Toggle Dark/Light Mode */}
        <div className="flex items-center justify-center">
          {open ? (
            <div className="toggle-switch">
              <label className="switch-label">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={tema === "dark"}
                  onChange={toggleTema}
                />
                <span className="slider"></span>
              </label>
            </div>
          ) : (
            <button onClick={toggleTema} className="p-1">
              {tema === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          )}
        </div>

        <button onClick={handleLogout} className={`px-1 py-2 rounded-xl ${logoutBg}`}>
          {open ? "⏻ Logout" : "⏻"}
        </button>
      </div>
    </motion.div>
  );
}
