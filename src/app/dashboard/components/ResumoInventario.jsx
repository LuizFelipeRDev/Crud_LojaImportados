"use client";
import { useEffect, useState } from "react";
import { Package, Layers, AlertCircle, Box } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ResumoInventario() {
  const [resumo, setResumo] = useState({
    produtosRegistrados: 0,
    emEstoque: 0,
    semEstoque: 0,
    foraCatalogo: 0,
  });
  const [loading, setLoading] = useState(true);
  const { tema } = useTheme(); // ✅ pega o tema atual

  const fetchResumo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/produtos/resumo");
      const data = await res.json();
      setResumo(data);
    } catch (err) {
      console.error("Erro ao buscar resumo do inventário:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumo();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 p-4 flex flex-col gap-4 items-center">
        <div className="loader"></div>
        <p className="text-sm">Aguarde, estamos buscando os dados.</p>
      </div>
    );

  const quadrados = [
    {
      title: "Produtos Registrados",
      value: resumo.produtosRegistrados,
      icon: <Package size={24} className="text-blue-500" />,
      bgLight: "bg-blue-100",
      bgDark: "bg-blue-900",
    },
    {
      title: "Em Estoque",
      value: resumo.emEstoque,
      icon: <Layers size={24} className="text-green-500" />,
      bgLight: "bg-green-100",
      bgDark: "bg-green-900",
    },
    {
      title: "Sem Estoque",
      value: resumo.semEstoque,
      icon: <AlertCircle size={24} className="text-red-500" />,
      bgLight: "bg-red-100",
      bgDark: "bg-red-900",
    },
    {
      title: "Fora de Catálogo",
      value: resumo.foraCatalogo,
      icon: <Box size={24} className="text-yellow-500" />,
      bgLight: "bg-yellow-100",
      bgDark: "bg-yellow-900",
    },
  ];

  return (
    <div className={`p-4 pb-8 rounded shadow-md ${tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h2 className="text-lg font-bold mb-4">Resumo do Inventário</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quadrados.map((q, idx) => (
          <div
            key={idx}
            className={`rounded-lg shadow p-4 flex items-center gap-4 ${
              tema === "dark" ? q.bgDark : q.bgLight
            }`}
          >
            <div>{q.icon}</div>
            <div>
              <p className={`text-[1.1rem] ${tema === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                {q.title}
              </p>
              <p className="text-xl font-bold">{q.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
