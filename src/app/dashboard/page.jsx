"use client"
import { useTheme } from "@/context/ThemeContext";
import ResumoInventario from "./components/ResumoInventario";
import GraficoMovimentacoes from "./components/GraficoMovimentacoes";
import GraficoTopProdutos from "./components/GraficoTopProdutos.jsx";
import GraficoLucroProdutos from "./components/GraficoLucroProdutos";
import GraficoEstoquePizza from "./components/GraficoEstoquePizza";
import GraficoEstoquePorMarca from "./components/GraficoEstoquePorMarca";


export default function DashboardPage() {
  const { tema } = useTheme();

  const cardBg = tema === "dark" ? "bg-gray-800" : "bg-gray-100";
  const cardText = tema === "dark" ? "text-gray-200" : "text-gray-900";
  const chartBg = tema === "dark" ? "bg-gray-700" : "bg-gray-300";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Dashboard!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-md flex items-center justify-center ${cardBg}`}>
          <ul className={`text-gray-900 space-y-1`}>
            <ResumoInventario />
          </ul>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}></h2>

          <GraficoMovimentacoes />

        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}></h2>
          <GraficoTopProdutos />
        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}></h2>
          <GraficoLucroProdutos />
        </div>


        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}></h2>
          <GraficoEstoquePizza />
        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}></h2>
          <GraficoEstoquePorMarca />
        </div>

      </div>


    </div>
  );
}
