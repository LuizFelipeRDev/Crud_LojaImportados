"use client";
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "@/context/ThemeContext";

export default function Estoque() {
    const [produtos, setProdutos] = useState([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState(""); // select simples
    const [produtosMulti, setProdutosMulti] = useState([]); // checkbox múltiplo
    const [ordenarPor, setOrdenarPor] = useState(""); // nome ou estoque
    const [ordem, setOrdem] = useState("crescente"); // crescente/decrescente
    const [loading, setLoading] = useState(true);
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const dropdownRef = useRef(null);

  const { tema } = useTheme();
  const headerBg = tema === "dark" ? "bg-gray-500 text-gray-200" : "bg-gray-200 text-gray-900";
    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickFora = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownAberto(false);
            }
        };
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    // Buscar produtos do backend
    useEffect(() => {
        setLoading(true);
        fetch("/api/produtos")
            .then(res => res.json())
            .then(data => {
                const normalizados = data.map(p => ({
                    id: p.ID.toString(),
                    produto: p.Nome,
                    categoria: p.Categoria,
                    marca: p.Marca,
                    estoque: Number(p.Unidade),
                }));
                normalizados.sort((a, b) => Number(a.id) - Number(b.id));
                setProdutos(normalizados);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Filtrar produtos
    const produtosFiltrados = produtos.filter((p) => {
        if (produtosMulti.length > 0) return produtosMulti.includes(p.id);
        if (produtoSelecionado === "todos") return true;
        if (produtoSelecionado === "") return false;
        return p.id === produtoSelecionado;
    });

    // Ordenar produtos
    const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
        if (!ordenarPor) return 0;
        const valA = ordenarPor === "nome" ? a.produto.toLowerCase() : a.estoque;
        const valB = ordenarPor === "nome" ? b.produto.toLowerCase() : b.estoque;
        if (valA < valB) return ordem === "crescente" ? -1 : 1;
        if (valA > valB) return ordem === "crescente" ? 1 : -1;
        return 0;
    });

    // Mostrar apenas últimos 10 produtos por padrão
    const produtosExibidos = produtoSelecionado === "" && produtosMulti.length === 0
        ? produtos.slice(-10).reverse()
        : produtosOrdenados;

    // Gerar PDF
    const gerarPDF = () => {
        if (!produtosExibidos.length) return;

        const doc = new jsPDF();
        const now = new Date();
        const dataHora = now.toLocaleString("pt-BR", { hour12: false });

        // Cabeçalho
        doc.setFontSize(16);
        doc.text("RELATÓRIO DE ESTOQUE", 14, 20);
        doc.setFontSize(11);
        doc.text(`Data/Hora: ${dataHora}`, 14, 28);
        doc.text(`Total de produtos: ${produtosExibidos.length}`, 14, 34);

        // Preparar tabela
        const tableData = produtosExibidos.map(p => [
            p.id,
            p.produto,
            p.categoria,
            p.marca,
            p.estoque
        ]);

        autoTable(doc, {
            startY: 42,
            head: [["ID", "Produto", "Categoria", "Marca", "Estoque"]],
            body: tableData,
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 }
        });

        doc.save("Relatorio_Estoque.pdf");
    };

    return (
        <div className="space-y-4 w-full">
            {/* Título no mesmo estilo */}
            <h2 className="text-xl font-bold border-2 rounded-2xl py-2 text-center">
                📦 Relatório de Estoque
            </h2>

            {loading ? (
                <div className="text-center text-gray-500 dark:text-gray-200 p-4 flex flex-col gap-2 items-center">
                    <div className="loader"></div>
                    <p className="text-sm">Aguarde, carregando os produtos do banco de dados...</p>
                </div>
            ) : (
                <>
                    {/* Filtros */}
                    <div className="flex gap-4 justify-center ">
                        {/* Select simples */}
                        <div>
                            <label className="mr-2 font-semibold">Produto:</label>
                            <select
                                value={produtoSelecionado}
                                onChange={(e) => setProdutoSelecionado(e.target.value)}
                                className="border px-2 py-1 rounded "
                            >
                                <option value="" className="text-black">Nenhum</option>
                                <option value="todos" className="text-black">Todos</option>
                                {produtos.map((p) => (
                                    <option className="text-black" key={p.id} value={p.id}>{p.produto}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dropdown múltiplo */}
                        <div className="relative w-48" ref={dropdownRef}>
                            <button
                                className="px-3 py-1 border rounded w-full text-left"
                                onClick={() => setDropdownAberto(!dropdownAberto)}
                            >
                                {produtosMulti.length === 0
                                    ? "Selecionar produtos"
                                    : `${produtosMulti.length} selecionados`}
                            </button>
                            {dropdownAberto && (
                                <div className="absolute mt-1 bg-white dark:bg-gray-800 border rounded shadow p-2 max-h-60 overflow-y-auto z-10">
                                    <button
                                        className="text-sm text-red-600 mb-2"
                                        onClick={() => setProdutosMulti([])}
                                    >
                                        Desmarcar todos
                                    </button>
                                    {produtos.map((p) => (
                                        <label key={p.id} className="flex items-center gap-2 py-1 text-black dark:text-gray-200">
                                            <input
                                                type="checkbox"
                                                value={p.id}
                                                checked={produtosMulti.includes(p.id)}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setProdutosMulti((prev) =>
                                                        prev.includes(val)
                                                            ? prev.filter((id) => id !== val)
                                                            : [...prev, val]
                                                    );
                                                }}
                                            />
                                            {p.produto}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ordenação */}
                        <div className="flex gap-2 items-center">
                            <label className="font-semibold">Ordenar por:</label>
                            <select
                                value={ordenarPor}
                                onChange={(e) => setOrdenarPor(e.target.value)}
                                className="border px-2 py-1 rounded"
                            >
                                <option value="" className="text-black">Nenhum</option>
                                <option value="nome" className="text-black">Nome</option>
                                <option value="estoque" className="text-black">Estoque</option>
                            </select>
                            <select
                                value={ordem}
                                onChange={(e) => setOrdem(e.target.value)}
                                className="border px-2 py-1 rounded"
                            >
                                <option value="crescente" className="text-black">Crescente</option>
                                <option value="decrescente" className="text-black">Decrescente</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="overflow-x-auto border rounded">
                        <table className="min-w-full table-auto text-center">
                            <thead className={` bg-gray-200 text-black`}>
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Produto</th>
                                    <th className="px-4 py-2">Categoria</th>
                                    <th className="px-4 py-2">Marca</th>
                                    <th className="px-4 py-2">Estoque</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosExibidos.map((p) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="px-4 py-2">{p.id}</td>
                                        <td className="px-4 py-2">{p.produto}</td>
                                        <td className="px-4 py-2">{p.categoria}</td>
                                        <td className="px-4 py-2">{p.marca}</td>
                                        <td className="px-4 py-2">{p.estoque}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Botão PDF */}
                    <div className="flex justify-end mt-4 pb-2">
                        <button
                            onClick={gerarPDF}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            📄 Gerar PDF
                        </button>
                    </div>
                </>
            )}
        </div>

    );
}
