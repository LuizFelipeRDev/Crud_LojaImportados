"use client";
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Spinner from "@/app/components/Spinner";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown } from "lucide-react";

export default function ProdutosPorFornecedor() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState([]);
  const [loadingFornecedores, setLoadingFornecedores] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [filtroQuantidade, setFiltroQuantidade] = useState("10");
  const [ordenacao, setOrdenacao] = useState("crescente");

  const dropdownRef = useRef();

  const { tema } = useTheme();
  const headerBg = tema === "dark" ? "bg-gray-500 text-gray-200" : "bg-gray-200 text-gray-900";

  useEffect(() => {
    setLoadingFornecedores(true);
    fetch("/api/fornecedores")
      .then((res) => res.json())
      .then((data) => setFornecedores(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingFornecedores(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFornecedor = (nome) => {
    if (nome === "todos") {
      setFornecedoresSelecionados(
        fornecedoresSelecionados.length === fornecedores.length ? [] : ["todos"]
      );
      return;
    }

    setFornecedoresSelecionados((prev) => {
      // remove "todos" se estava selecionado
      const withoutTodos = prev.filter((f) => f !== "todos");
      return withoutTodos.includes(nome)
        ? withoutTodos.filter((f) => f !== nome)
        : [...withoutTodos, nome];
    });
  };

  const filtrarProdutos = () => {
    if (fornecedoresSelecionados.length === 0) return;

    setLoadingProdutos(true);
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => {
        const produtosNormalizados = data.map((p) => {
          const obj = {};
          for (const key in p) obj[key.toLowerCase()] = p[key];
          return obj;
        });

        let filtrados = produtosNormalizados.filter((p) =>
          fornecedoresSelecionados.includes("todos") ||
          fornecedoresSelecionados.includes(p.fornecedores)
        );

        // Ordenação
        filtrados.sort((a, b) => {
          const valA = Number(a.unidade) || 0;
          const valB = Number(b.unidade) || 0;
          return ordenacao === "crescente" ? valA - valB : valB - valA;
        });

        // Filtrar quantidade
        if (filtroQuantidade !== "todos") {
          const qtd = Number(filtroQuantidade);
          filtrados = filtrados.slice(-qtd);
        }

        setProdutos(filtrados);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingProdutos(false));
  };

  const gerarPDF = () => {
    if (!produtos.length) return;

    const doc = new jsPDF();
    const now = new Date();
    const dataHora = now.toLocaleString("pt-BR", { hour12: false });

    doc.setFontSize(16);
    doc.text("RELATÓRIO DE PRODUTOS POR FORNECEDOR", 14, 20);
    doc.setFontSize(11);
    doc.text(
      `Fornecedores: ${fornecedoresSelecionados.includes("todos")
        ? "Todos"
        : fornecedoresSelecionados.join(", ")
      }`,
      14,
      30
    );
    doc.text(`Data/Hora: ${dataHora}`, 14, 36);
    doc.text(`Total de produtos: ${produtos.length}`, 14, 42);

    const startY = 50;
    const tableData = produtos.map((p) => [p.nome, p.categoria, p.marca, p.unidade]);
    autoTable(doc, {
      startY,
      head: [["Nome", "Categoria", "Marca", "Unidade"]],
      body: tableData,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
    });

    doc.save(`Produtos_Fornecedores.pdf`);
  };

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-bold border-2 rounded-2xl py-2 text-center">
        🏭 Produtos por Fornecedor
      </h2>

      {/* ===========Filtros============= */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <label className="mr-2 font-semibold">Fornecedor:</label>

          <div className="relative w-80" ref={dropdownRef}>
            <ChevronDown className="absolute right-1 top-2" />
            <button
              onClick={() => setDropdownAberto(!dropdownAberto)}
              className="px-4 py-2 border rounded w-full text-left"
            >
              {fornecedoresSelecionados.length
                ? fornecedoresSelecionados.includes("todos")
                  ? "Todos"
                  : `${fornecedoresSelecionados.length} selecionados`
                : "Selecione fornecedores"}
            </button>

            {dropdownAberto && (
              <div className="absolute bg-white border mt-1 rounded shadow w-full max-h-60 overflow-y-auto z-10 p-2">
                {loadingFornecedores ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <Spinner className="w-6 h-6" />
                    <p className="text-sm text-gray-500">Carregando fornecedores...</p>
                  </div>
                ) : fornecedores.length === 0 ? (
                  <p className="text-center text-gray-500 py-2">Nenhum fornecedor</p>
                ) : (
                  <>
                    <label className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={fornecedoresSelecionados.includes("todos")}
                        onChange={() => toggleFornecedor("todos")}
                      />
                      <p className="text-black">Todos</p>
                    </label>
                    {fornecedores.map((f) => (
                      <label key={f.id} className="flex items-center gap-2 py-1 text-black">
                        <input
                          type="checkbox"
                          checked={fornecedoresSelecionados.includes(f.nome)}
                          onChange={() => toggleFornecedor(f.nome)}
                        />
                        {f.nome}
                      </label>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Mostrar:</label>
            <select
              value={filtroQuantidade}
              onChange={(e) => setFiltroQuantidade(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="todos" className="text-black">Todos</option>
              <option value="10" className="text-black">Últimos 10</option>
              <option value="5" className="text-black">Últimos 5</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Ordenar Unidade:</label>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="crescente" className="text-black">Crescente</option>
              <option value="decrescente" className="text-black">Decrescente</option>
            </select>
          </div>

          <button
            onClick={filtrarProdutos}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </div>

      {loadingProdutos ? (
        <div className="overflow-x-auto  mt-4 flex justify-center items-center p-8">
          <div className="text-center text-gray-500 p-4 flex flex-col gap-2 items-center">
            <div className="loader"></div>
            <p className="text-sm">Carregando compras por Movimento...</p>
          </div>
        </div>
      ) : produtos.length > 0 ? (
        <div className="overflow-x-auto border rounded mt-4">
          <table className="min-w-full table-auto text-center">
            <thead className={`bg-gray-200 text-black`}>
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Marca</th>
                <th className="px-4 py-2">Unidade</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{p.nome}</td>
                  <td className="px-4 py-2">{p.categoria}</td>
                  <td className="px-4 py-2">{p.marca}</td>
                  <td className="px-4 py-2">{p.unidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loadingProdutos && (
          <div className="p-4 text-center text-gray-500">
            Nenhum produto encontrado para os fornecedores selecionados.
          </div>
        )
      )}

      <div className="flex justify-end mt-4 pb-2">
        <button
          onClick={gerarPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={loadingProdutos || !produtos.length}
        >
          📄 Gerar PDF
        </button>
      </div>
    </div>
  );
}
