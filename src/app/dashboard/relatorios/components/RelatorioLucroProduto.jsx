"use client";
import React, { useState, useEffect, useRef } from "react";
import { FileText, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import Spinner from "@/app/components/Spinner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function RelatorioLucro() {
    const [produtos, setProdutos] = useState([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [movimentos, setMovimentos] = useState([]);
    const [dadosFiltrados, setDadosFiltrados] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [periodoInicio, setPeriodoInicio] = useState(null);
    const [periodoFim, setPeriodoFim] = useState(null);
    const [dropdownAberto, setDropdownAberto] = useState(false);
    const [memoriaAberta, setMemoriaAberta] = useState(false);
    const dropdownRef = useRef();

    // Busca produtos
    useEffect(() => {
        async function fetchProdutos() {
            const res = await fetch("/api/produtos");
            const json = await res.json();
            setProdutos(json);
        }
        fetchProdutos();
    }, []);

    // Busca movimentações
    useEffect(() => {
        async function fetchMovimentos() {
            const res = await fetch("/api/movimentacoes");
            const json = await res.json();
            setMovimentos(json);
        }
        fetchMovimentos();
    }, []);

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownAberto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    const formatarMoeda = (valor) => {
        if (valor === null || valor === undefined || valor === "") return "R$ 0,00";

        let numero = valor;

        if (typeof valor === "string") {
            // Remove separadores de milhar e troca vírgula por ponto
            numero = valor.replace(/\./g, "").replace(",", ".");
            numero = parseFloat(numero);
        } else {
            numero = Number(valor);
        }

        if (isNaN(numero)) return "R$ 0,00";

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };


    const filtrarMovimentos = () => {
        if (!produtoSelecionado || !periodoInicio || !periodoFim) return;
        setCarregando(true);
        setTimeout(() => {
            const filtrados = movimentos.filter((m) => {
                if (m["ID Produto"] !== produtoSelecionado) return false;
                const dataMov = new Date(m["Periodo"].split("/").reverse().join("-"));
                if (dataMov < periodoInicio || dataMov > periodoFim) return false;
                return true;
            });
            setDadosFiltrados(filtrados);
            setCarregando(false);
        }, 500);
    };

    const parseNumero = (valor) => {
        if (valor === null || valor === undefined || valor === "") return 0;

        if (typeof valor === "string") {
            // remove pontos de milhar e troca vírgula por ponto
            valor = valor.replace(/\./g, "").replace(",", ".");
        }

        const numero = parseFloat(valor);
        return isNaN(numero) ? 0 : numero;
    };


    const calcularRelatorio = () => {
        if (!dadosFiltrados.length) return null;

        // Separar compras e vendas
        const compras = dadosFiltrados.filter((m) => m.Tipo === "Compra");
        const vendas = dadosFiltrados.filter((m) => m.Tipo === "Venda");

        // Totais e quantidades
        const totalCompras = compras.reduce((acc, c) => acc + parseNumero(c["Valor Total"]), 0);
        const totalVendas = vendas.reduce((acc, v) => acc + parseNumero(v["Valor Total"]), 0);

        const qtdComprada = compras.reduce((acc, c) => acc + parseNumero(c.Quantidade), 0);
        const qtdVendida = vendas.reduce((acc, v) => acc + parseNumero(v.Quantidade), 0);

        // Saldo acumulado
        let saldo = 0;
        const saldoAcumulado = [];
        dadosFiltrados.forEach((item) => {
            saldo += item.Tipo === "Compra" ? -parseNumero(item["Valor Total"]) : parseNumero(item["Valor Total"]);
            saldoAcumulado.push(saldo);
        });

        // Inicializa resumo
        const resumo = {
            qtdComprada,
            qtdVendida,
            totalCompras,
            totalVendas,
            saldoAcumulado,
            memoria: [],
            lucroTotal: 0,
            lucroMedio: 0,
        };

        // Custo médio unitário
        let custoAcumulado = compras.reduce((acc, c) => acc + parseNumero(c["Valor Total"]), 0);
        const custoUnitario = qtdComprada ? custoAcumulado / qtdComprada : 0;

        resumo.custoUnitario = custoUnitario

        //Custo das Mercadorias Vendidas (CMV)
        const cmvTotal = qtdVendida ? custoUnitario * qtdVendida : 0
        resumo.cmvTotal = cmvTotal

        //Venda Média
        const vendaMedia = qtdVendida ? totalVendas / qtdVendida : 0
        resumo.vendaMedia = vendaMedia

        // Memória de cálculo (cada venda)
        vendas.forEach((v) => {
            const custoTotalVenda = custoUnitario * parseNumero(v.Quantidade);
            const lucroVenda = parseNumero(v["Valor Total"]) - custoTotalVenda;

            resumo.memoria.push({
                quantidade: parseNumero(v.Quantidade),
                valorUnitario: parseNumero(v.ValorUnitario),
                receita: parseNumero(v["Valor Total"]),
                custo: custoTotalVenda,
                lucro: lucroVenda,
            });
        });

        // Lucro total e médio
        resumo.lucroTotal = resumo.memoria.reduce((acc, m) => acc + m.lucro, 0);
        resumo.lucroMedio = qtdVendida ? resumo.lucroTotal / qtdVendida : 0;

        return resumo;
    };


    const resumo = calcularRelatorio();
    const produtoAtual = produtos.find((p) => p.ID === produtoSelecionado);


    //RELATORIO=============
    const gerarPDF = () => {
        if (!dadosFiltrados.length) return;
        const doc = new jsPDF();
        const dataAtual = new Date().toLocaleDateString("pt-BR");
        const horaAtual = new Date().toLocaleTimeString("pt-BR");

        doc.setFontSize(16);
        doc.text("RELATÓRIO DE LUCRO POR PRODUTO", 14, 15);
        doc.setFontSize(11);
        doc.text(`Produto: ${produtoAtual?.Nome}`, 14, 22);
        doc.text(`Período: ${periodoInicio?.toLocaleDateString()} a ${periodoFim?.toLocaleDateString()}`, 14, 28);
        doc.text(`Data de geração: ${dataAtual} ${horaAtual}`, 14, 34);

        // Memória de cálculo
        let y = 42;
        doc.setFontSize(12);
        doc.text("MEMÓRIA DE CÁLCULO", 14, y);
        y += 6;

        // Custo Médio Unitário
    doc.setFontSize(10);
        doc.text(
            `Custo Médio Und: ${formatarMoeda(resumo.totalCompras)} / ${resumo.qtdComprada} = ${formatarMoeda(resumo.custoUnitario)}`,
            14,
            y
        );
        y += 6;

        // CMV
        doc.text(
            `Custo das Mercadorias Vendidas (CMV): ${resumo.qtdVendida} × ${formatarMoeda(resumo.custoUnitario)} = ${formatarMoeda(resumo.cmvTotal)}`,
            14,
            y
        );
        y += 6;

     // Lucro Total
doc.text("Lucro Total = Receita - Custo", 14, y);
y += 6;
doc.text(`${formatarMoeda(resumo.totalVendas)} - ${formatarMoeda(resumo.cmvTotal)} = ${formatarMoeda(resumo.lucroTotal)}`, 14, y);
y += 8;

// Lucro Médio por Unidade Vendida
doc.text("Lucro Médio por Unidade Vendida = LucroTotal / UnidadesVendidas", 14, y);
y += 6;
doc.text(`${formatarMoeda(resumo.lucroTotal)} / ${resumo.qtdVendida} = ${formatarMoeda(resumo.lucroMedio)}`, 14, y);
y += 2;

        // Tabela
        const colunas = ["Data", "Tipo", "Qtd", "Valor Unitário", "Valor Total", "Saldo Acumulado"];
        const linhas = dadosFiltrados.map((item, idx) => [
            item.Periodo,
            item.Tipo,
            item.Quantidade,
            formatarMoeda(item.ValorUnitario),
            formatarMoeda(item["Valor Total"]),
            formatarMoeda(resumo.saldoAcumulado[idx]),
        ]);

        autoTable(doc, { head: [colunas], body: linhas, startY: y + 6 });
        doc.save("RelatorioLucro.pdf");
    };

    return (
        <div className="space-y-4 w-full">
            <h2 className="text-xl font-bold border-2 rounded-2xl py-2 text-center">📊 Relatório de Lucro por Produto</h2>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                <div className="relative w-80" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownAberto(!dropdownAberto)}
                        className="px-4 py-2 border rounded w-full text-left relative"
                    >
                        {produtoSelecionado ? produtoAtual?.Nome : "Selecione o produto"}
                        <ChevronDown className="absolute top-2.5 right-2 pointer-events-none" />
                    </button>
                    {dropdownAberto && (
                        <div className="absolute bg-white border text-black mt-1 rounded shadow w-full max-h-60 overflow-y-auto z-10 p-2">
                            {produtos.length && movimentos.length ? (
                                produtos
                                    // Filtra apenas produtos que possuem algum movimento
                                    .filter((p) => movimentos.some((m) => m["ID Produto"] === p.ID))
                                    .map((p) => (
                                        <div
                                            key={p.ID}
                                            className="cursor-pointer hover:bg-gray-100 px-2 py-1"
                                            onClick={() => {
                                                setProdutoSelecionado(p.ID);
                                                setDropdownAberto(false);
                                            }}
                                        >
                                            {p.Nome}
                                        </div>
                                    ))
                            ) : (
                                <div className="flex justify-center items-center py-4">
                                    <Spinner />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <label className="font-semibold">Período:</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={periodoInicio ? periodoInicio.toISOString().substr(0, 10) : ""}
                            onChange={(e) => setPeriodoInicio(e.target.value ? new Date(e.target.value) : null)}
                            className="border px-2 py-1 rounded"
                        />
                        <input
                            type="date"
                            value={periodoFim ? periodoFim.toISOString().substr(0, 10) : ""}
                            onChange={(e) => setPeriodoFim(e.target.value ? new Date(e.target.value) : null)}
                            className="border px-2 py-1 rounded"
                        />
                    </div>
                </div>

                <button
                    onClick={filtrarMovimentos}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Filtrar
                </button>
            </div>

            {carregando ? (
                <div className="text-center text-gray-500 p-4 flex flex-col gap-2 items-center">
                    <Spinner /> <p className="text-sm">Carregando relatório...</p>
                </div>
            ) : !dadosFiltrados.length ? (
                <div className="flex flex-col justify-center items-center h-40 text-gray-400 gap-2 mt-12">
                    <FileText size={60} /> <p>Nenhum relatório gerado</p>
                </div>
            ) : (
                <>
                    <div className="border rounded flex flex-col items-center py-2">
                        <h3 className="font-bold text-lg">{produtoAtual?.Nome}</h3>
                        <p>Estoque atual: {produtoAtual?.Unidade || 0}</p>
                    </div>

                    {resumo && (
                        <div className="grid md:grid-cols-3 gap-4 border rounded p-4">
                            <div>
                                <h3 className="font-bold">📥 Compras</h3>
                                <p>Qtd: {resumo.qtdComprada}</p>
                                <p>Total: {formatarMoeda(resumo.totalCompras)}</p>
                                <p>Custo Médio: {formatarMoeda(resumo.custoUnitario)}</p>
                            </div>
                            <div>
                                <h3 className="font-bold">📤 Vendas</h3>
                                <p>Qtd: {resumo.qtdVendida}</p>
                                <p>Total: {formatarMoeda(resumo.totalVendas)}</p>
                                <p>Venda Média: {formatarMoeda(resumo.vendaMedia)}</p>
                            </div>
                            <div>
                                <h3 className="font-bold">💰 Resultado</h3>
                                <p>Lucro Total: {formatarMoeda(resumo.lucroTotal)}</p>
                                <p>Lucro Médio Und: {formatarMoeda(resumo.lucroMedio)}</p>
                                <p>CMV : {formatarMoeda(resumo.cmvTotal)}</p>
                            </div>
                        </div>
                    )}

                    {/* Acordeon Memória de Cálculo */}
                    {resumo && (
                        <div className="border rounded mt-4 ">
                            <button
                                className="w-full px-4 py-2 text-left flex justify-between items-center font-semibold text-black bg-gray-200"
                                onClick={() => setMemoriaAberta(!memoriaAberta)}
                            >
                                <div className="flex gap-1 items-center "><Calculator size={20} /><p className="font-bold">Memória de Cálculo</p></div> {memoriaAberta ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {memoriaAberta && (
                                <div className="p-4 ">

                                    <div className="">
                                        <p>Custo Médio Und: {formatarMoeda(resumo.totalCompras)} / {resumo.qtdComprada} = <strong>{formatarMoeda(resumo.custoUnitario)}</strong></p>
                                    </div>
                                    <div className="mb-2">
                                        <p>Custo das Mercadorias Vendidas (CMV): {resumo.qtdVendida} x {formatarMoeda(resumo.custoUnitario)} = <strong>{formatarMoeda(resumo.cmvTotal)}</strong></p>
                                    </div>
                                    <div className="mb-2">
                                        <p>Lucro Total = Receita - Custo   &#8680;  {formatarMoeda(resumo.totalVendas)} - {formatarMoeda(resumo.cmvTotal)} = <strong>{formatarMoeda(resumo.lucroTotal)}</strong></p>
                                    </div>
                                    <div className="">
                                        <p>Lucro Médio por Unidade Vendida = LucroTotal / UnidadesVendidas   &#8680;  {formatarMoeda(resumo.lucroTotal)} / {resumo.qtdVendida} = <strong>{formatarMoeda(resumo.lucroMedio)}</strong></p>
                                    </div>



                                </div>
                            )}
                        </div>
                    )}

                    {/* Tabela */}
                    <div className="overflow-x-auto border rounded mt-4">
                        <table className="min-w-full table-auto text-center border">
                            <thead className="bg-gray-200 text-black">
                                <tr>
                                    <th className="border px-2 py-1">Data</th>
                                    <th className="border px-2 py-1">Tipo</th>
                                    <th className="border px-2 py-1">Qtd</th>
                                    <th className="border px-2 py-1">Valor Unitário</th>
                                    <th className="border px-2 py-1">Valor Total</th>
                                    <th className="border px-2 py-1">Saldo Acumulado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dadosFiltrados.map((item, idx) => (
                                    <tr key={item["Mov ID"]}>
                                        <td className="border px-2 py-1">{item.Periodo}</td>
                                        <td className="border px-2 py-1">{item.Tipo}</td>
                                        <td className="border px-2 py-1">{item.Quantidade}</td>
                                        <td className="border px-2 py-1">{formatarMoeda(item.ValorUnitario)}</td>
                                        <td className="border px-2 py-1">{formatarMoeda(item["Valor Total"])}</td>
                                        <td className="border px-2 py-1">{formatarMoeda(resumo.saldoAcumulado[idx])}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={gerarPDF}
                        className="my-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        📄 Gerar PDF
                    </button>
                </>
            )}
        </div>
    );
}
