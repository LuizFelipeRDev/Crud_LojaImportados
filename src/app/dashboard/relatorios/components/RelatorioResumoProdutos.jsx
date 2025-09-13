"use client";
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from "@/context/ThemeContext";

export default function RelatorioResumoProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { tema } = useTheme();
  const headerBg = tema === "dark" ? "bg-gray-500 text-gray-200" : "bg-gray-200 text-gray-900";

  const filtrarProdutos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos resumidos
  const totalAtivo = produtos.filter(p => p.Ativo?.toLowerCase() === "sim").length;
  const totalInativo = produtos.filter(p => p.Ativo?.toLowerCase() === "não").length;

  const totalComEstoque = produtos.filter(p => Number(p.Unidade) > 0).length;
  const totalSemEstoque = produtos.filter(p => Number(p.Unidade) === 0).length;
  const totalReservado = produtos.filter(p => Number(p.Reservado) > 0).length;

  const gerarPDF = () => {
    if (!produtos.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RELATÓRIO RESUMIDO DE PRODUTOS", 14, 20);
    doc.setFontSize(11);
    doc.text(`Total de produtos: ${produtos.length}`, 14, 30);

    // Status
    autoTable(doc, {
      startY: 40,
      head: [["Status", "Total"]],
      body: [
        ["Ativo", totalAtivo],
        ["Inativo", totalInativo],
      ],
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
    });

    const yAfterStatus = doc.lastAutoTable.finalY + 10;

    // Estoque
    autoTable(doc, {
      startY: yAfterStatus,
      head: [["Estoque", "Total"]],
      body: [
        ["Com estoque", totalComEstoque],
        ["Sem estoque", totalSemEstoque],
        ["Reservado", totalReservado],
      ],
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 },
    });

    doc.save("ResumoProdutos.pdf");
  };

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-bold border-2 rounded-2xl py-2 text-center">
        📊 Resumo de Produtos
      </h2>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex gap-1 items-center">
          <p>Gerar Relatório:</p>
        <button
          onClick={filtrarProdutos}
          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Filtrar
        </button>
        </div>
        
      </div>

      {loading ? (
        <div className="text-center text-gray-500 p-4 flex flex-col gap-2 items-center">
          <div className="loader"></div>
          <p className="text-sm">Carregando produtos...</p>
        </div>
      ) : produtos.length > 0 ? (
       <div className="flex flex-col gap-6 mt-4">

  {/* Tabela Status */}
  <table className="w-full table-auto text-center border border-collapse" style={{ tableLayout: 'fixed' }}>
    <colgroup>
      <col className="w-2/3" />
      <col className="w-1/3" />
    </colgroup>
    <thead className={headerBg}>
      <tr>
        <th className="px-4 py-2">Status dos Produtos</th>
        <th className="px-4 py-2">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t">
        <td className="px-4 py-2">Ativo</td>
        <td className="px-4 py-2">{totalAtivo}</td>
      </tr>
      <tr className="border-t">
        <td className="px-4 py-2">Inativo</td>
        <td className="px-4 py-2">{totalInativo}</td>
      </tr>
    </tbody>
  </table>

  {/* Tabela Estoque */}
  <table className="w-full table-auto text-center border border-collapse" style={{ tableLayout: 'fixed' }}>
    <colgroup>
      <col className="w-2/3" />
      <col className="w-1/3" />
    </colgroup>
    <thead className={headerBg}>
      <tr>
        <th className="px-4 py-2">Estoque</th>
        <th className="px-4 py-2">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t">
        <td className="px-4 py-2">Com estoque</td>
        <td className="px-4 py-2">{totalComEstoque}</td>
      </tr>
      <tr className="border-t">
        <td className="px-4 py-2">Sem estoque</td>
        <td className="px-4 py-2">{totalSemEstoque}</td>
      </tr>
      <tr className="border-t">
        <td className="px-4 py-2">Reservado</td>
        <td className="px-4 py-2">{totalReservado}</td>
      </tr>
    </tbody>
  </table>

</div>

      ) : (
        <p className="text-center text-gray-500">Clique em "Filtrar" para gerar o relatório.</p>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={gerarPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={!produtos.length}
        >
          📄 Gerar PDF
        </button>
      </div>
    </div>
  );
}
