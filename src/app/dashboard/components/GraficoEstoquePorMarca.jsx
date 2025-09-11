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
  "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080",
  "#ffd8b1", "#000075", "#aaffc3", "#808000", "#ffe119"
];

export default function GraficoEstoquePorMarca() {
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
    const agrupadoPorMarca = {};

    produtos.forEach((p) => {
      const marca = p.Marca || "Sem Marca";
      const unidades = Number(String(p.Unidade).replace(",", ".") || 0);

      if (!agrupadoPorMarca[marca]) agrupadoPorMarca[marca] = 0;
      agrupadoPorMarca[marca] += unidades;
    });

    const marcasOrdenadas = Object.entries(agrupadoPorMarca)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // mostra as 10 marcas com mais estoque!!!!!!!!!!! <===

    return {
      labels: marcasOrdenadas.map(([marca]) => marca),
      datasets: [
        {
          data: marcasOrdenadas.map(([_, qtd]) => qtd),
          backgroundColor: marcasOrdenadas.map((_, i) => cores[i % cores.length]),
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className={`p-4 rounded shadow-md ${tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h2 className="text-lg font-bold mb-4">Top Marcas por Estoque</h2>
      <Doughnut
        data={processarDados()}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: tema === "dark" ? "#fff" : "#000",
                font: {
                  size: 11,
                  
                },
                generateLabels: (chart) => {
                  const data = chart.data;
                  const dataset = data.datasets[0];
                  const isDark = tema === "dark";

                  return data.labels.map((label, i) => ({
                    text: `${label}: ${dataset.data[i]}`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor?.[i] || dataset.backgroundColor[i],
                    lineWidth: 1,
                    hidden: chart.getDatasetMeta(0).data[i].hidden,
                    index: i,
                    fontColor: isDark ? "#fff" : "#000", 
                  }));
                },
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
