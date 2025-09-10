"use client";
import { useState, useEffect } from "react";
import ProdutoModal from "../produtos/components/ProdutoModal";
import ProdutoTable from "../produtos/components/ProdutoTable";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true); // novo estado
  const [openModal, setOpenModal] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState(null);

  // Carregar produtos da API
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/produtos");
        const data = await res.json();
        setProdutos(data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const handleNovo = () => {
    setProdutoEdit(null);
    setOpenModal(true);
  };

  const handleEditar = (produto) => {
    setProdutoEdit(produto);
    setOpenModal(true);
  };

  const handleSalvar = async (produto) => {
    const method = produto.ID ? "PUT" : "POST";
    await fetch("/api/produtos", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produto),
    });

    const res = await fetch("/api/produtos");
    setProdutos(await res.json());
    setOpenModal(false);
  };

  const handleExcluir = async (id) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    try {
      await fetch("/api/produtos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: id }),
      });
      setProdutos((prev) => prev.filter((p) => p.ID !== id));
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={handleNovo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Adicionar Produto
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 p-4 flex flex-col items-center">
          <div class="loader"></div>
          <p className="text-sm">Aguarde, estamos buscando os dados.</p>
        </div>
      ) : (
        <ProdutoTable
          produtos={produtos}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
        />
      )}

      {openModal && (
        <ProdutoModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          produtoEdit={produtoEdit}
          onSubmit={handleSalvar}
        />
      )}
    </div>
  );
}
