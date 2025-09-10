"use client";
import { useEffect, useState } from "react";
import { Package, Layers, AlertCircle, Box } from "lucide-react"; // ícones opcionais

export default function ResumoInventario() {
  const [resumo, setResumo] = useState({
    produtosRegistrados: 0,
    emEstoque: 0,
    semEstoque: 0,
    foraCatalogo: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchResumo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/produtos/resumo"); // rota GETResumo
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

  if (loading) return <div className="text-center text-gray-500 p-4 flex flex-col gap-4 items-center">
    <div class="loader"></div>
    <p className="text-sm">Aguarde, estamos buscando os dados.</p>
  </div>;

  const quadrados = [
    {
      title: "Produtos Registrados",
      value: resumo.produtosRegistrados,
      icon: <Package size={24} className="text-blue-500" />,
      bg: "bg-blue-100",
    },
    {
      title: "Em Estoque",
      value: resumo.emEstoque,
      icon: <Layers size={24} className="text-green-500" />,
      bg: "bg-green-100",
    },
    {
      title: "Sem Estoque",
      value: resumo.semEstoque,
      icon: <AlertCircle size={24} className="text-red-500" />,
      bg: "bg-red-100",
    },
    {
      title: "Fora de Catálogo",
      value: resumo.foraCatalogo,
      icon: <Box size={24} className="text-yellow-500" />,
      bg: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {quadrados.map((q, idx) => (
        <div
          key={idx}
          className={`${q.bg} rounded-lg shadow p-4 flex items-center gap-4`}
        >
          <div>{q.icon}</div>
          <div>
            <p className="text-sm text-gray-600">{q.title}</p>
            <p className="text-xl font-bold">{q.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
