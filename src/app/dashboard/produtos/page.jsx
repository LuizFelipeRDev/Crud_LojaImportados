"use client";
import { useState, useEffect } from "react";
import ProdutoModal from "../produtos/components/ProdutoModal";
import ProdutoTable from "../produtos/components/ProdutoTable";
import { X, DiamondPlus } from "lucide-react";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState(null);

  const [showAviso, setShowAviso] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);
  const [avisoMensagem, setAvisoMensagem] = useState(
    "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
  );

  const [filtro, setFiltro] = useState("");
  const [marcaSelecionada, setMarcaSelecionada] = useState("Todas");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenacao, setOrdenacao] = useState("asc");

  const itensPorPagina = 20;

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

    try {
      const res = await fetch("/api/produtos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar produto");
      }

      const atualizados = await fetch("/api/produtos");
      setProdutos(await atualizados.json());
      setOpenModal(false);
    } catch (err) {
      console.error("Erro ao salvar produto:", err.message);
      alert("Falha ao salvar produto: " + err.message);
    }
  };

  const handleExcluir = (id) => {
    setIdParaExcluir(id);
    setAvisoMensagem(
      "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
    );
    setShowAviso(true);
  };

  const confirmarExclusao = async () => {
    try {
      const res = await fetch("/api/produtos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID: idParaExcluir }),
      });

      const data = await res.json();

      if (res.status === 400 && data.error.includes("movimentações")) {
        setAvisoMensagem(data.error);
        setShowAviso(true);
      } else {
        setProdutos((prev) => prev.filter((p) => p.ID !== idParaExcluir));
        setShowAviso(false);
        setIdParaExcluir(null);
      }
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      setAvisoMensagem("Ocorreu um erro ao tentar excluir o produto.");
      setShowAviso(true);
    }
  };

  // 🔍 Filtros dinâmicos
  const marcas = ["Todas", ...new Set(produtos.map((p) => p.Marca?.trim()))];
  const categorias = ["Todas", ...new Set(produtos.map((p) => p.Categoria?.trim()))];

  const produtosFiltrados = produtos
    .filter((p) =>
      p.Nome?.toLowerCase().includes(filtro.toLowerCase()) &&
      (marcaSelecionada === "Todas" || p.Marca === marcaSelecionada) &&
      (categoriaSelecionada === "Todas" || p.Categoria === categoriaSelecionada)
    )
    .sort((a, b) => {
      const qA = Number(a.Unidade);
      const qB = Number(b.Unidade);
      return ordenacao === "asc" ? qA - qB : qB - qA;
    });

  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const produtosPaginados = produtosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={handleNovo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex gap-1"
        >
          <DiamondPlus /> Adicionar Produto
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Filtrar por nome..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPaginaAtual(1);
          }}
          className="px-3 py-2 border rounded-md w-[240px]"
        />

        <select
          value={marcaSelecionada}
          onChange={(e) => {
            setMarcaSelecionada(e.target.value);
            setPaginaAtual(1);
          }}
          className="px-3 py-2 border rounded-md w-[180px] overflow-auto"
          style={{ maxHeight: "200px" }}
        >
          {marcas.map((marca, i) => (
            <option key={i} value={marca}>
              {marca}
            </option>
          ))}
        </select>


        <select
          value={categoriaSelecionada}
          onChange={(e) => {
            setCategoriaSelecionada(e.target.value);
            setPaginaAtual(1);
          }}
          className="px-3 py-2 border rounded-md w-[180px]"
        >
          {categorias.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            setOrdenacao((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="px-3 py-2  bg-gray-200 rounded hover:bg-gray-300 w-52"
        >
          Ordenar por Unidade ({ordenacao === "asc" ? "↑" : "↓"})
        </button>
      </div>


      {loading ? (
        <div className="text-center text-gray-500 p-4 flex flex-col gap-4 items-center">
          <div className="loader"></div>
          <p className="text-sm">Aguarde, estamos buscando os dados.</p>
        </div>
      ) : (
        <>
          <ProdutoTable
            produtos={produtosPaginados}
            onEditar={handleEditar}
            onExcluir={handleExcluir}
          />

          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {openModal && (
        <ProdutoModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          produtoEdit={produtoEdit}
          onSubmit={handleSalvar}
        />
      )}

      {showAviso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-80 relative flex flex-col items-center text-center">
            <button
              onClick={() => setShowAviso(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="alert-icon mb-4">
              <X />
            </div>

            <h3 className="alert-title font-bold text-lg mb-2">Aviso</h3>
            <p className="alert-message text-sm mb-4">{avisoMensagem}</p>

            <div className="alert-actions flex justify-center gap-2 w-full">
              {!avisoMensagem.includes("movimentações") && (
                <button
                  type="button"
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={confirmarExclusao}
                >
                  Sim, excluir
                </button>
              )}
              <button
                type="button"
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowAviso(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
