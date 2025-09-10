"use client";
import { useEffect, useState } from "react";
import TabelaMovimentacoes from "./components/TabelaMovimentacoes";
import ModalMovimentacoes from "./components/ModalMovimentacoes";


export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMov, setEditMov] = useState(null);

  // Função de busca reutilizável
  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/movimentacoes");
      const data = await res.json();
      setMovimentacoes(data);
    } catch (err) {
      console.error("Erro ao carregar movimentações:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar na montagem
  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  const handleAdd = async (mov) => {
    try {
      const res = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mov),
      });

      if (res.ok) {
        // Recarrega a lista sem reload da página
        await fetchMovimentacoes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimentações</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Adicionar Movimentação
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 p-6 flex flex-col items-center">
          <div className="loader mb-2"></div>
          <p className="text-sm">Aguarde, estamos buscando os dados.</p>
        </div>
      ) : (
        <TabelaMovimentacoes movimentacoes={movimentacoes} />
      )}

      {modalOpen && (
        <ModalMovimentacoes
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditMov(null); }}
          onSubmit={handleAdd}
          movimentacaoEdit={editMov}
        />
      )}
    </div>
  );
}
