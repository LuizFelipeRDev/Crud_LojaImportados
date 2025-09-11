"use client";
import { useState } from "react";
import { X } from "lucide-react";
import ModalMovimentacoes from "./ModalMovimentacoes";

export default function TabelaMovimentacoes({ movimentacoes }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAviso, setShowAviso] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);
  const [erroMovimentacao, setErroMovimentacao] = useState("");

  const parseDecimalBR = (v) => {
    if (v == null) return 0;
    return Number(String(v).replace(/\./g, "").replace(",", "."));
  };

  const formatBR = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return "0,00";
    return x.toFixed(2).replace(".", ",");
  };

  const handleExcluir = (id) => {
    setIdParaExcluir(id);
    setShowAviso(true);
  };

  const confirmarExclusao = async () => {
    try {
      const res = await fetch("/api/movimentacoes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: idParaExcluir }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErroMovimentacao(result.error || "Erro ao excluir movimentação");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      setErroMovimentacao("Erro inesperado ao excluir.");
    } finally {
      setShowAviso(false);
      setIdParaExcluir(null);
    }
  };

  if (!movimentacoes || movimentacoes.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4 mt-8">
        <p className="text-sm">Nenhuma movimentação encontrada para este mês.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr className="text-black">
            <th className="border-b p-2">ID</th>
            <th className="border-b p-2">Produto</th>
            <th className="border-b p-2">Quantidade</th>
            <th className="border-b p-2">Valor Unitário</th>
            <th className="border-b p-2">Valor Total</th>
            <th className="border-b p-2">Período</th>
            <th className="border-b p-2">Tipo</th>
            <th className="p-3 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {movimentacoes.map((m, idx) => {
            const valorUnitarioNum = parseDecimalBR(m.ValorUnitario);
            const valorTotalNum = parseDecimalBR(m["Valor Total"]);

            return (
              <tr key={m["Mov ID"] ?? idx} className="text-center hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700">
                <td className="border-b p-2">{m["ID Produto"]}</td>
                <td className="border-b p-2">{m["Nome Produto"]}</td>
                <td className="border-b p-2">{m.Quantidade}</td>
                <td className="border-b p-2">{formatBR(valorUnitarioNum)}</td>
                <td className="border-b p-2">{formatBR(valorTotalNum)}</td>
                <td className="border-b p-2">{m.Periodo}</td>
                <td className="border-b p-2">
                  {m["Tipo"] === "Venda" ? (
                    <span className="text-green-600 font-bold">Venda</span>
                  ) : (
                    <span className="text-red-600 font-bold">Compra</span>
                  )}
                </td>
                <td className="p-2 border-b">
                  <button
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    onClick={() => handleExcluir(m["Mov ID"])}
                  >
                    <X size={16} /> Excluir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isModalOpen && (
        <ModalMovimentacoes
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => setIsModalOpen(false)}
        />
      )}

      {erroMovimentacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="alert-box">
            <div className="alert-header">
              <div className="alert-icon text-red-600">
                <X />
              </div>
              <div className="alert-content">
                <h3 className="alert-title font-bold text-lg">Erro na movimentação</h3>
                <p className="alert-message text-sm mt-2">{erroMovimentacao}</p>
              </div>
              <div className="alert-actions mt-4 flex justify-center gap-2">
                <button
                  className="alert-cancel px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setErroMovimentacao("")}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAviso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="alert-box">
            <div className="alert-header">
              <div className="alert-icon">
                <X />
              </div>
              <div className="alert-content">
                <h3 className="alert-title">Excluir movimentação</h3>
                <p className="alert-message">
                  Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="alert-actions">
                <button className="alert-confirm" onClick={confirmarExclusao}>
                  Sim, excluir
                </button>
                <button className="alert-cancel" onClick={() => setShowAviso(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
