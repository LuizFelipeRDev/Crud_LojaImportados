"use client";
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "@/context/ThemeContext";
import Spinner from "@/app/components/Spinner";
import { ChevronDown, FileText } from "lucide-react";

export default function Estoque() {
    const [produtos, setProdutos] = useState([]); // lista completa
    const [produtosSelecionados, setProdutosSelecionados] = useState([]); // checkboxes
    const [produtosFiltrados, setProdutosFiltrados] = useState([]); // produtos exibidos na tabela
    const [ordenarPor, setOrdenarPor] = useState("");
    const [ordem, setOrdem] = useState("crescente");
    const [carregado, setCarregado] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const [carregando, setCarregando] = useState(true);
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

    // Carregar produtos para dropdown
    useEffect(() => {
        async function fetchProdutos() {
            setCarregando(true);
            try {
                const res = await fetch("/api/produtos");
                if (!res.ok) throw new Error("Erro ao buscar produtos");
                const data = await res.json();
                setProdutos(data); // mantém a lista completa
            } catch (err) {
                console.error("Erro ao carregar produtos:", err);
                setProdutos([]);
            } finally {
                setCarregando(false);
            }
        }
        fetchProdutos();
    }, []);

    const toggleProduto = (id) => {
        setProdutosSelecionados((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const marcarTodos = () => {
        const todosIDs = produtos.map((p) => p.ID);
        setProdutosSelecionados(todosIDs);
    };

    const desmarcarTodos = () => setProdutosSelecionados([]);

    // Filtrar produtos e atualizar tabela
    const carregarProdutos = () => {
        setLoading(true);
        // normaliza os dados
        const normalizados = produtos.map((p) => ({
            id: p.ID.toString(),
            produto: p.Nome,
            categoria: p.Categoria,
            marca: p.Marca,
            estoque: Number(p.Unidade),
        }));

        // aplica filtro
        const filtrados =
            produtosSelecionados.length > 0
                ? normalizados.filter((p) => produtosSelecionados.includes(p.id))
                : normalizados;

        // aplica ordenação
        const ordenados = [...filtrados].sort((a, b) => {
            if (!ordenarPor) return 0;
            const valA = ordenarPor === "nome" ? a.produto.toLowerCase() : a.estoque;
            const valB = ordenarPor === "nome" ? b.produto.toLowerCase() : b.estoque;
            if (valA < valB) return ordem === "crescente" ? -1 : 1;
            if (valA > valB) return ordem === "crescente" ? 1 : -1;
            return 0;
        });

        setProdutosFiltrados(ordenados);
        setCarregado(true);
        setLoading(false);
    };

    // Gerar PDF
    const gerarPDF = () => {
        if (!produtosFiltrados.length) return;

        const doc = new jsPDF();
        const now = new Date();
        const dataHora = now.toLocaleString("pt-BR", { hour12: false });

        doc.setFontSize(16);
        doc.text("RELATÓRIO DE ESTOQUE", 14, 20);
        doc.setFontSize(11);
        doc.text(`Data/Hora: ${dataHora}`, 14, 28);
        doc.text(`Total de produtos: ${produtosFiltrados.length}`, 14, 34);

        const tableData = produtosFiltrados.map((p) => [
            p.id,
            p.produto,
            p.categoria,
            p.marca,
            p.estoque,
        ]);

        autoTable(doc, {
            startY: 42,
            head: [["ID", "Produto", "Categoria", "Marca", "Estoque"]],
            body: tableData,
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
        });

        doc.save("Relatorio_Estoque.pdf");
    };

    return (
        <div className="space-y-4 w-full">
            <h2 className="text-xl font-bold border-2 rounded-2xl py-2 text-center">
                📦 Relatório de Estoque
            </h2>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 justify-center">
                <div className="relative w-80" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownAberto(!dropdownAberto)}
                        className="px-4 py-2 border rounded w-full text-left relative"
                    >
                        {produtosSelecionados.length
                            ? `${produtosSelecionados.length} produtos selecionados`
                            : "Selecione os produtos"}
                        <ChevronDown className="absolute top-2.5 right-2 pointer-events-none" />
                    </button>

                    {dropdownAberto && (
                        <div className="absolute bg-white border mt-1 rounded shadow w-full max-h-60 overflow-y-auto z-10 p-2">
                            {carregando ? (
                                <div className="flex justify-center py-2">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            onClick={marcarTodos}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Todos
                                        </button>
                                        <button
                                            onClick={desmarcarTodos}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Nenhum
                                        </button>
                                    </div>
                                    {produtos.length ? (
                                        produtos.map((p) => (
                                            <div key={p.ID}>
                                                <label className="flex items-center gap-2 text-black">
                                                    <input
                                                        type="checkbox"
                                                        checked={produtosSelecionados.includes(p.ID)}
                                                        onChange={() => toggleProduto(p.ID)}
                                                    />
                                                    {p.Nome}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm text-center py-2">
                                            Nenhum produto encontrado
                                        </p>
                                    )}
                                </>
                            )}
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
                        <option value="" className="text-black">
                            Nenhum
                        </option>
                        <option value="nome" className="text-black">
                            Nome
                        </option>
                        <option value="estoque" className="text-black">
                            Estoque
                        </option>
                    </select>
                    <select
                        value={ordem}
                        onChange={(e) => setOrdem(e.target.value)}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="crescente" className="text-black">
                            Crescente
                        </option>
                        <option value="decrescente" className="text-black">
                            Decrescente
                        </option>
                    </select>
                </div>

                {/* Botão azul */}
                <button
                    onClick={carregarProdutos}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Filtrar
                </button>
            </div>

            {/* Conteúdo */}
            {loading ? (
                <div className="text-center text-gray-500 dark:text-gray-200 p-4 flex flex-col gap-2 items-center">
                    <div className="loader"></div>
                    <p className="text-sm">Carregando produtos...</p>
                </div>
            ) : carregado ? (
                <>
                    <div className="overflow-x-auto border rounded">
                        <table className="min-w-full table-auto text-center">
                            <thead className={headerBg}>
                                <tr>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Produto</th>
                                    <th className="px-4 py-2">Categoria</th>
                                    <th className="px-4 py-2">Marca</th>
                                    <th className="px-4 py-2">Estoque</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosFiltrados.map((p) => (
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

                    <div className="flex justify-end mt-4 pb-2">
                        <button
                            onClick={gerarPDF}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            📄 Gerar PDF
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col justify-center items-center h-40 text-gray-400 gap-2 mt-12">
                    <FileText size={60} /> <p className="text-center">Nenhum relatório gerado<br />Clique em "Filtrar" para gerar</p>
                </div>
            )}
        </div>
    );
}
