"use client";
import { useState, useEffect, useRef } from "react";
import FornecedorModal from "./components/FornecedorModal";
import FornecedorTable from "./components/FornecedorTable";
import { X, DiamondPlus, Search, Truck } from "lucide-react";

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [fornecedorEdit, setFornecedorEdit] = useState(null);

  const [showAviso, setShowAviso] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);
  const [avisoMensagem, setAvisoMensagem] = useState(
    "Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita."
  );

  const [termoBusca, setTermoBusca] = useState("");
  const inputRef = useRef(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  useEffect(() => {
    const fetchFornecedores = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/fornecedores");
        const data = await res.json();
        setFornecedores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar fornecedores:", err);
        setFornecedores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFornecedores();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  const handleNovo = () => {
    setFornecedorEdit(null);
    setOpenModal(true);
  };

  const handleEditar = (fornecedor) => {
    setFornecedorEdit(fornecedor);
    setOpenModal(true);
  };

  const handleSalvar = async (fornecedor) => {
    const method = fornecedor.id ? "PUT" : "POST";

    try {
      const res = await fetch("/api/fornecedores", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fornecedor),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar fornecedor");
      }

      const atualizados = await fetch("/api/fornecedores");
      setFornecedores(await atualizados.json());
      setOpenModal(false);
    } catch (err) {
      console.error("Erro ao salvar fornecedor:", err.message);
      alert("Falha ao salvar fornecedor: " + err.message);
    }
  };

  const handleExcluir = (id) => {
    setIdParaExcluir(id);
    setAvisoMensagem(
      "Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita."
    );
    setShowAviso(true);
  };
  const excluirFornecedor = async (id) => {
    try {
      const res = await fetch("/api/fornecedores", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAvisoMensagem(data.error || "Erro ao excluir fornecedor");
        setShowAviso(true);
        return;
      }


    } catch (err) {
      setAvisoMensagem("Erro inesperado ao tentar excluir");
      setShowAviso(true);
    }
  };



  const confirmarExclusao = async () => {
    try {
      const res = await fetch("/api/fornecedores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idParaExcluir }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAvisoMensagem(data.error || "Erro ao excluir fornecedor.");
        setShowAviso(true);
      } else {
        setFornecedores((prev) => prev.filter((f) => f.id !== idParaExcluir));
        setShowAviso(false);
        setIdParaExcluir(null);
      }
    } catch (err) {
      console.error("Erro ao excluir fornecedor:", err);
      setAvisoMensagem("Ocorreu um erro ao tentar excluir o fornecedor.");
      setShowAviso(true);
    }
  };

  const fornecedoresFiltrados = fornecedores.filter((f) =>
    f.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    f.email.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaFornecedores = fornecedoresFiltrados.slice(inicio, fim);

  return (
    <div className="space-y-4 w-full pt-8 relative">

      <div className="text-2xl font-bold border-2 rounded-2xl py-2 flex items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Truck />
          <h1 className="title">Fornecedores</h1>
        </div>
      </div>

<div className="flex justify-between items-center absolute top-[2.37rem] max-lg:top-[2.2rem] right-1.5 max-lg:right-1">
        <button
          onClick={handleNovo}
          className="bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center rounded-r-xl  px-3 py-2 lg:px-4 lg:py-2 transition-all"
        >
          <DiamondPlus className="w-5 h-5" />
          <span className="hidden lg:inline ml-2">Adicionar Movimentação</span>
        </button>
      </div>


      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div
          className="flex items-center border-2 rounded w-full md:w-1/2 px-3 py-2 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <Search className=" mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="bg-transparent focus:outline-none w-full"
          />
          {!termoBusca && (
            <label
              onClick={() => inputRef.current?.focus()}
              className="absolute  pointer-events-none ml-8 text-gray-500"
            >
              Buscar por nome ou email...
            </label>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 p-4 flex flex-col gap-4 items-center">
          <div className="loader"></div>
          <p className="text-sm">Aguarde, estamos buscando os dados.</p>
        </div>
      ) : (
        <FornecedorTable
          fornecedores={paginaFornecedores}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
        />
      )}

      {openModal && (
        <FornecedorModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          fornecedorEdit={fornecedorEdit}
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
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
          disabled={paginaAtual === 1}
          className="pr-3 pl-2 py-1 border-2 relative rounded disabled:opacity-80 
               transition-transform duration-200 hover:-translate-x-1"
        >
          ← Anterior
        </button>

        <span className="text-sm font-medium">
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          onClick={() =>
            setPaginaAtual((p) => (p < totalPaginas ? p + 1 : p))
          }
          disabled={paginaAtual >= totalPaginas}
          className="pr-1 pl-3 py-1 border-2 relative rounded disabled:opacity-80 
               transition-transform duration-200 hover:translate-x-1"
        >
          Próxima →
        </button>
      </div>


      {showAviso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-80 relative flex flex-col items-center text-center">
            <button
              onClick={() => setShowAviso(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="alert-icon mb-4 text-red-600">
              <X size={32} />
            </div>

            <h3 className="alert-title font-bold text-lg mb-2">Aviso</h3>
            <p className="alert-message text-sm mb-4">{avisoMensagem}</p>

            <div className="alert-actions flex justify-center gap-2 w-full">
              {!avisoMensagem.includes("vinculado") && (
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
