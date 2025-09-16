"use client";
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronDown, FileText } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Spinner from "@/app/components/Spinner";
import { EnterpriseName } from "@/app/helper/helper";

export default function ComprasPorMovimento() {
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const [ordenacao, setOrdenacao] = useState("crescente");
  const [periodoInicio, setPeriodoInicio] = useState(null);
  const [periodoFim, setPeriodoFim] = useState(null);

  const dropdownRef = useRef();

  const { tema } = useTheme();
  const headerBg = tema === "dark" ? "bg-gray-500 text-gray-200" : "bg-gray-200 text-gray-900";


  // Busca apenas produtos com tipo "Compra"
  useEffect(() => {
    async function fetchProdutosComCompra() {
      try {
        const res = await fetch("/api/movimentacoes");
        const json = await res.json();

        const compras = json.filter(item => item.Tipo === "Compra");

        // Extrai produtos únicos
        const produtosUnicos = Array.from(
          new Map(compras.map(p => [p["ID Produto"], p])).values()
        );

        setProdutos(produtosUnicos);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProdutosComCompra();
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

  const toggleProduto = (id) => {
    if (produtoSelecionado.includes(id)) {
      setProdutoSelecionado(produtoSelecionado.filter((p) => p !== id));
    } else {
      setProdutoSelecionado([...produtoSelecionado, id]);
    }
  };

  const marcarTodos = () => setProdutoSelecionado(produtos.map((p) => p["ID Produto"]));
  const desmarcarTodos = () => setProdutoSelecionado([]);

  const formatarMoeda = (valor) => {
    const numero = Number(valor.toString().replace(",", "."));
    if (isNaN(numero) || numero === 0) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const calcularTotal = () => {
    return dadosFiltrados.reduce((acc, item) => {
      const numero = Number(item["Valor Total"].toString().replace(",", "."));
      return acc + (isNaN(numero) ? 0 : numero);
    }, 0);
  };

  // Filtra apenas movimentos do tipo "Compra"
  const filtrarCompras = async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/movimentacoes");
      const json = await res.json();

      const compras = json.filter(item => item.Tipo === "Compra");

      const filtradas = compras
        .filter((item) => !produtoSelecionado.length || produtoSelecionado.includes(item["ID Produto"]))
        .filter((item) => {
          const dataMov = new Date(item["Periodo"].split("/").reverse().join("-"));
          if (periodoInicio && dataMov < periodoInicio) return false;
          if (periodoFim && dataMov > periodoFim) return false;
          return true;
        })
        .sort((a, b) =>
          ordenacao === "crescente"
            ? Number(a.Quantidade) - Number(b.Quantidade)
            : Number(b.Quantidade) - Number(a.Quantidade)
        );

      setDadosFiltrados(filtradas);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  // Relatório PDF
  const gerarPDF = () => {
    if (!dadosFiltrados.length) return;

    const totalGeral = calcularTotal();
    const doc = new jsPDF();

    // Data e hora atual
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("RELATÓRIO DE COMPRAS POR MOVIMENTO", 14, 15);

    doc.setFontSize(11);
    doc.text(`Empresa: ${EnterpriseName}`, 14, 22);
    doc.text(`Data de geração: ${dataAtual}`, 14, 28);
    doc.text(`Hora de geração: ${horaAtual}`, 14, 34);
    doc.text(`Total de registros: ${dadosFiltrados.length}`, 14, 40);

    // Tabela
    const colunas = ["Mov ID", "Produto", "Quantidade", "Período", "Valor Unitário", "Valor Total"];
    const linhas = dadosFiltrados.map((item) => [
      item["Mov ID"],
      item["Nome Produto"],
      item["Quantidade"],
      item["Periodo"],
      formatarMoeda(item["ValorUnitario"]),
      formatarMoeda(item["Valor Total"]),
    ]);

    autoTable(doc, {
      head: [colunas],
      body: linhas,
      startY: 46, // espaçamento após cabeçalho
    });

    // TOTAL GERAL com estilo
    const yAfterTable = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 100;
    const textoTotal = `TOTAL GERAL: ${totalGeral.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`;
    const larguraTexto = doc.getTextWidth(textoTotal);
    const larguraPagina = doc.internal.pageSize.getWidth();
    const margemDireita = 14;
    const posX = larguraPagina - larguraTexto - margemDireita;
    const posY = yAfterTable;

    // Fundo azul
    doc.setFillColor(0, 102, 204);
    doc.rect(posX - 3, posY - 6, larguraTexto + 6, 9, "F");

    // Texto branco
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(textoTotal, posX, posY);

    doc.save("TotalCompras.pdf");
  };


  const totalGeral = calcularTotal();

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-bold border-2 rounded-2xl py-2 text-center">📊 Compras por Movimento</h2>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Dropdown produtos */}
        <div className="relative w-80" ref={dropdownRef}>
          <button
            onClick={() => setDropdownAberto(!dropdownAberto)}
            className="px-4 py-2 border rounded w-full text-left relative"
          >
            {produtoSelecionado.length
              ? `${produtoSelecionado.length} produtos selecionados`
              : "Selecione os produtos"}
            <ChevronDown className="absolute top-2.5 right-2 pointer-events-none" />
          </button>

          {dropdownAberto && (
            <div className="absolute bg-white border mt-1 rounded shadow w-full max-h-60 overflow-y-auto z-10 p-2">
              {carregando ? (
                <p className="text-gray-500 text-sm text-center py-2">
                  Carregando produtos...
                </p>
              ) : (
                <>
                  <button
                    onClick={marcarTodos}
                    className="text-blue-600 hover:underline text-sm mb-1"
                  >
                    Marcar todos
                  </button>
                  <button
                    onClick={desmarcarTodos}
                    className="text-red-600 hover:underline text-sm mb-2 ml-2"
                  >
                    Desmarcar todos
                  </button>

                  {produtos.length ? (
                    produtos.map((p) => (
                      <div key={p["ID Produto"]}>
                        <label className="flex items-center gap-2 text-black">
                          <input
                            type="checkbox"
                            checked={produtoSelecionado.includes(p["ID Produto"])}
                            onChange={() => toggleProduto(p["ID Produto"])}
                          />
                          {p["Nome Produto"]}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center py-2">
                      <Spinner />
                    </div>

                  )}
                </>
              )}
            </div>
          )}

        </div>


        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <label className="font-semibold">Ordenar por Quantidade:</label>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="crescente" className="text-black">Crescente</option>
            <option value="decrescente" className="text-black">Decrescente</option>
          </select>
        </div>

        {/* Período */}
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
          onClick={filtrarCompras}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Filtrar
        </button>
      </div>

      {carregando ? (
        <div className="text-center text-gray-500 p-4 flex flex-col gap-2 items-center">
          <div className="loader"></div>
          <p className="text-sm">Carregando compras por Movimento...</p>
        </div>
      ) : !dadosFiltrados.length ? (
        <div className="flex flex-col justify-center items-center h-40 text-gray-400 gap-2 mt-12">
          <FileText size={60} /> <p className="text-center">Nenhum relatório gerado<br />Clique em "Filtrar" para gerar</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full table-auto text-center border">
              <thead className={headerBg}>
                <tr>
                  <th className="border px-2 py-1">Mov ID</th>
                  <th className="border px-2 py-1">Produto</th>
                  <th className="border px-2 py-1">Quantidade</th>
                  <th className="border px-2 py-1">Período</th>
                  <th className="border px-2 py-1">Valor Unitário</th>
                  <th className="border px-2 py-1">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((item) => (
                  <tr key={item["Mov ID"]}>
                    <td className="border px-2 py-1">{item["Mov ID"]}</td>
                    <td className="border px-2 py-1">{item["Nome Produto"]}</td>
                    <td className="border px-2 py-1">{item["Quantidade"]}</td>
                    <td className="border px-2 py-1">{item["Periodo"]}</td>
                    <td className="border px-2 py-1">{formatarMoeda(item["ValorUnitario"])}</td>
                    <td className="border px-2 py-1">{formatarMoeda(item["Valor Total"])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center font-semibold mt-2   flex justify-end w-full">
            <p className="w-60 border-2 rounded-md p-2"> Total geral: {totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>

          <div className="flex justify-end mt-4 pb-2">
            <button
              onClick={gerarPDF}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!dadosFiltrados.length}
            >
              📄 Gerar PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
