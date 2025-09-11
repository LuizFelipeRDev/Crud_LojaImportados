"use client";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTheme } from "@/context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const cores = [
  "#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4",
  "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080"
];

export default function GraficoEstoquePizza() {
  const [produtos, setProdutos] = useState([]);
  const { tema } = useTheme();

  useEffect(() => {
    const fetchProdutos = async () => {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(data);
    };
    fetchProdutos();
  }, []);

  const processarDados = () => {
    const produtosComEstoque = produtos.map(p => ({
      nome: p.Nome,
      quantidade: Number(String(p.Unidade).replace(",", ".") || 0),
    }));

    const top5 = produtosComEstoque
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    return {
      labels: top5.map(p => p.nome),
      datasets: [
        {
          data: top5.map(p => p.quantidade),
          backgroundColor: top5.map((_, i) => cores[i % cores.length]),
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className={`p-4 rounded shadow-md ${tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h2 className="text-lg font-bold mb-4">Top 5 Produtos com Maior Estoque</h2>
      <Doughnut
        data={processarDados()}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: tema === "dark" ? "#fff" : "#000",
              },
            },
            datalabels: {
              color: tema === "dark" ? "#fff" : "#000",
              formatter: (value, ctx) => {
                const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percent = (value / total) * 100;
                return percent >= 5 ? `${percent.toFixed(1)}%` : ""; // NÂO MOSTRA MENOR Q 5%
              }
              ,
              font: {
                weight: "bold",
                size: 14,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw} unidades`,
              },
            },
          },
        }}
      />

    </div>
  );
}
