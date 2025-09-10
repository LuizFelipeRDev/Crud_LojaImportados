"use client"
import { useTheme } from "@/context/ThemeContext";
import ResumoInventario from "./components/ResumoInventario";


export default function DashboardPage() {
  const { tema } = useTheme();

  const cardBg = tema === "dark" ? "bg-gray-800" : "bg-gray-100";
  const cardText = tema === "dark" ? "text-gray-200" : "text-gray-900";
  const chartBg = tema === "dark" ? "bg-gray-700" : "bg-gray-300";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Dashboard!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}>Produtos/Quantidade</h2>
          <ul className={`text-gray-900 space-y-1`}>
             <ResumoInventario/>
          </ul>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}>Compra/Venda</h2>
            <div className={`h-32 rounded mt-2 ${chartBg}`}></div>
          
        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}>Caixa (Receita/Saída)</h2>
          <div className={`h-32 rounded mt-2 ${chartBg}`}></div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${cardBg}`}>
          <h2 className={`text-xl font-bold mb-2 ${cardText}`}>Resumo rápido</h2>
          <p className={cardText}>Pedidos em andamento, alertas e notificações.</p>
        </div>
      </div>

      <div className={`p-6 rounded-lg shadow-md ${cardBg} mt-6`}>
        <h2 className={`text-xl font-bold mb-2 ${cardText}`}>Relatório consolidado</h2>
        <div className={`h-48 rounded mt-2 ${chartBg}`}></div>
      </div>
    </div>
  );
}
