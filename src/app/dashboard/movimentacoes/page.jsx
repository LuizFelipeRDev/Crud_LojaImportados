"use client";
import React, { useEffect, useState } from "react";
import TabelaMovimentacoes from "./components/TabelaMovimentacoes";
import ModalMovimentacoes from "./components/ModalMovimentacoes";
import { DiamondPlus, X, FileQuestion, Search, Box, Calendar, CalendarMinus2, Repeat } from "lucide-react";

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMov, setEditMov] = useState(null);
  const [erroMovimentacao, setErroMovimentacao] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [nomeProdutoFiltro, setNomeProdutoFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ordenarPor, setOrdenarPor] = useState("id-desc"); 
  const itensPorPagina = 20;
  const [tipoFiltro, setTipoFiltro] = useState(""); 


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

  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  useEffect(() => {
    if (movimentacoes.length === 0) return;

    const datasValidas = movimentacoes.map((m) => {
      const [dia, mes, ano] = m.Periodo.split("/");
      return new Date(Number(ano), Number(mes) - 1, Number(dia));
    });

    const maisRecente = datasValidas.sort((a, b) => b.getTime() - a.getTime())[0];

    setAnoSelecionado(String(maisRecente.getFullYear()));
    setMesSelecionado(String(maisRecente.getMonth() + 1));
  }, [movimentacoes]);

  const anosDisponiveis = () => {
    const atual = new Date().getFullYear();
    const anos = [];
    for (let a = 2023; a <= atual; a++) anos.push(String(a));
    return anos.reverse();
  };

  const mesesDisponiveis = [
    { nome: "Todos os meses", valor: "" },
    { nome: "Janeiro", valor: "1" },
    { nome: "Fevereiro", valor: "2" },
    { nome: "Março", valor: "3" },
    { nome: "Abril", valor: "4" },
    { nome: "Maio", valor: "5" },
    { nome: "Junho", valor: "6" },
    { nome: "Julho", valor: "7" },
    { nome: "Agosto", valor: "8" },
    { nome: "Setembro", valor: "9" },
    { nome: "Outubro", valor: "10" },
    { nome: "Novembro", valor: "11" },
    { nome: "Dezembro", valor: "12" },
  ];

  // helpers rqu usados nos numeros string > number <string alem de remover ,
  const parseNumberSafe = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    let s = String(val).replace(/\s/g, "").replace(/[^0-9\-,.]/g, "");
    if (!s) return 0;
    // se tiver '.' e ',' -> '.' é milhares e ',' decimal
    if (s.indexOf(",") > -1 && s.indexOf(".") > -1) {
      s = s.replace(/\./g, "").replace(/,/g, ".");
    } else if (s.indexOf(",") > -1 && s.indexOf(".") === -1) {
      s = s.replace(/,/g, ".");
    }
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const parsePeriodoToDate = (periodo) => {
    if (!periodo) return new Date(0);
    const parts = periodo.split("/");
    if (parts.length !== 3) return new Date(0);
    const [dia, mes, ano] = parts;
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  };

  const movimentacoesFiltradas = movimentacoes
    .filter((m) => {
      const data = parsePeriodoToDate(m.Periodo);
      const anoMov = data.getFullYear().toString();
      const mesMov = (data.getMonth() + 1).toString();

      const filtroAno = anoMov === anoSelecionado;
      const filtroMes = mesSelecionado === "" || mesMov === mesSelecionado;

      const filtroNome = (m["Nome Produto"] || "")
        .toLowerCase()
        .includes(nomeProdutoFiltro.toLowerCase());

      const filtroTipo = tipoFiltro === "" || m["Tipo"] === tipoFiltro;

      return filtroAno && filtroMes && filtroNome && filtroTipo;
    })
    .sort((a, b) => {
      switch (ordenarPor) {
        case "id-asc":
          return Number(a["ID Produto"]) - Number(b["ID Produto"]);
        case "id-desc":
          return Number(b["ID Produto"]) - Number(a["ID Produto"]);
        case "valor-asc":
          return parseNumberSafe(a["Valor Total"]) - parseNumberSafe(b["Valor Total"]);
        case "valor-desc":
          return parseNumberSafe(b["Valor Total"]) - parseNumberSafe(a["Valor Total"]);
        default:
          const dA = parsePeriodoToDate(a.Periodo);
          const dB = parsePeriodoToDate(b.Periodo);
          return dB - dA;
      }
    });



  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaMovimentacoes = movimentacoesFiltradas.slice(inicio, fim);

  const handleAdd = async (mov) => {
    try {
      const res = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mov),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchMovimentacoes();
        setModalOpen(false);
        setErroMovimentacao("");
      } else {
        setErroMovimentacao(result.error || "Erro ao registrar movimentação");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setErroMovimentacao("Erro inesperado ao registrar movimentação.");
    }
  };

  return (
    <div className="space-y-4 w-full pt-8 relative">
      <div className="text-2xl font-bold border-2 rounded-2xl py-2 flex items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Repeat />
          <h1>Movimentações</h1>
        </div>
      </div>

      <div className="flex justify-between items-center absolute top-[2.37rem] right-1.5">
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 flex gap-1"
        >
          <DiamondPlus /> Adicionar Movimentação
        </button>
      </div>

      {/* =========Filtros */}
      <div className="flex justify-center flex-wrap gap-4 mb-4 items-center z-10 transition-colors duration-300 py-6">

        {/* Ano */}
        <div>
          <div className="flex gap-1 items-center dark mb-1">
            <Calendar size={18} />
            <label className="block text-sm font-medium">Ano:</label>
          </div>
          <select value={anoSelecionado} onChange={(e) => setAnoSelecionado(e.target.value)} className="px-3 py-2 border rounded dark">
            {anosDisponiveis().map((ano) => (
              <option key={ano} value={ano} className="text-black">
                {ano}
              </option>
            ))}
          </select>
        </div>

        {/* Mês */}
        <div>
          <div className="flex gap-1 items-center dark mb-1">
            <CalendarMinus2 size={18} />
            <label className="block text-sm font-medium">Mês:</label>
          </div>
          <select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} className="px-3 py-2 border rounded dark">
            {mesesDisponiveis.map((mes) => (
              <option key={mes.valor} value={mes.valor} className="text-black">
                {mes.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Produto */}
        <div className="relative w-[240px]">
          <div className="flex gap-1 items-center dark mb-1">
            <Box size={18} />
            <label className="block text-sm font-medium">Filtrar por Produto:</label>
          </div>

          <input type="text" value={nomeProdutoFiltro} onChange={(e) => setNomeProdutoFiltro(e.target.value)} placeholder="Ex: PlayStation" className="px-3 py-2 pr-10 border rounded-md w-full placeholder-gray-500" />
          <span className="absolute right-3 top-9 text-gray-400 dark:text-gray-500">
            <Search size={18} />
          </span>
        </div>

        {/* Tipo (Todos / Compra / Venda) */}
        <div>
          <div className="flex gap-1 items-center dark mb-1">
            <Repeat size={18} />
            <label className="block text-sm font-medium">Tipo:</label>
          </div>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="px-3 py-2 border rounded dark"
          >
            <option value="" className="text-black">Todos</option>
            <option value="Compra" className="text-black">Compra</option>
            <option value="Venda" className="text-black">Venda</option>
          </select>
        </div>

        {/* Filtro Ordenação */}
        <div className="relative group w-full max-w-md">
          <div className="radio-input grid grid-cols-2 gap-2 p-2 dark rounded-lg border-[1px] transition-colors duration-300">
            {[
              { value: "id-desc", label: "ID ↓" },
              { value: "id-asc", label: "ID ↑" },
              { value: "valor-desc", label: "Valor ↓" },
              { value: "valor-asc", label: "Valor ↑" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all border ${ordenarPor === opt.value ? "bg-blue-600 text-white border-blue-600" : "bg-transparent"
                  }`}
              >
                <input
                  type="radio"
                  name="ordenarPor"
                  value={opt.value}
                  checked={ordenarPor === opt.value}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                  className="hidden"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="absolute top-full mt-2 left-0 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Selecione o critério de ordenação dos produtos
          </div>
        </div>


      </div>



      {loading ? (
        <div className="text-center text-gray-500 p-6 gap-4 flex flex-col items-center">
          <div className="loader mb-2" />
          <p className="text-sm">Aguarde, estamos buscando os dados.</p>
        </div>
      ) : movimentacoesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 text-gray-400">
          <FileQuestion className="w-12 h-12 mb-2" />
          <p>Nenhuma movimentação registrada neste filtro.</p>
        </div>
      ) : (
        <TabelaMovimentacoes movimentacoes={paginaMovimentacoes} />
      )}

      {modalOpen && <ModalMovimentacoes isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditMov(null); }} onSubmit={handleAdd} onError={(mensagem) => setErroMovimentacao(mensagem)} />}

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
                <button className="alert-cancel px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => setErroMovimentacao("")}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center gap-2 mt-4">
        <button onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))} disabled={paginaAtual === 1} className="pr-3 pl-2 py-1 border-2 relative rounded disabled:opacity-80 transition-transform duration-200 hover:-translate-x-1">
          ← Anterior
        </button>

        <span className="text-sm font-medium">
          Página {paginaAtual} de {Math.ceil(movimentacoesFiltradas.length / itensPorPagina)}
        </span>

        <button
          onClick={() => setPaginaAtual((p) => (p < Math.ceil(movimentacoesFiltradas.length / itensPorPagina) ? p + 1 : p))}
          disabled={paginaAtual >= Math.ceil(movimentacoesFiltradas.length / itensPorPagina)}
          className="pr-1 pl-3 py-1 border-2 relative rounded disabled:opacity-80 transition-transform duration-200 hover:translate-x-1"
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
