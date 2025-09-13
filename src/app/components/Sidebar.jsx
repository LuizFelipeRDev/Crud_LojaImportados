"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Truck, Home, Box, BarChart, Settings, Sun, Moon, Repeat, Newspaper, MessageCircleQuestionMark } from "lucide-react";
import { motion } from "framer-motion";

import Image from "next/image";
import LueLogo from "../assets/logo.svg"

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
    { name: "Fornecedores", icon: <Truck size={20} />, path: "/dashboard/fornecedores" },
    { name: "Relatórios", icon: <Newspaper size={20} />, path: "/dashboard/relatorios" },
    { name: "Ajuda", icon: <MessageCircleQuestionMark size={20} />, path: "/dashboard/ajuda" },
  ];


  return (
    <motion.div
      animate={{ width: open ? 64 * 4 : 16 * 4 }}
      className={`h-screen flex flex-col justify-between p-4 ${sidebarBg} border-r-2 ${sidebarBorder} relative`}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`absolute top-4 right-[-24px] w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 shadow-md ${tema === "dark"
          ? "bg-gray-700 hover:bg-gray-600 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-black"
          }`}
      >
        <span className="text-xl font-bold transition-transform duration-300">
          {open ? "⮜" : "⮞"}
        </span>
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
        {/* Descrição discreta acima do separador */}
        {open && (
          <div className="flex flex-col gap2 items-center" >
            <Image src={LueLogo} width={120} height={120} alt="Lue Logo" className="w-8 h-8 dark" />
            <div className=" text-gray-500 text-center  italic">
              A Lue Site
            </div>

          </div>
        )}

        {/* Separador visual */}
        {open && <hr className={`my-4 border-t ${tema === "dark" ? "border-gray-700" : "border-gray-300"}`} />}

        {/* Toggle Dark/Light Mode */}
        <button
          onClick={toggleTema}
          className={`flex h-10 items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${tema === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
        >
          {open ? (
            <>
              {tema === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              <span className="font-medium">
                {tema === "dark" ? "Modo Escuro" : "Modo Claro"}
              </span>
            </>
          ) : (

            <span className="ml-[-0.42rem] ">
              {tema === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </span>

          )}
        </button>

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className={`flex h-10 items-center gap-2 px-3  py-2 rounded-lg transition-colors duration-200 ${tema === "dark"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
            }`}
        >
          {open ? (
            <>
              <span className="text-lg">⏻</span>
              <span className="font-medium">Logout</span>
            </>
          ) : (
            <span className="text-lg ml-[-0.37rem]">⏻</span>
          )}
        </button>

      </div>
    </motion.div>
  );
}
