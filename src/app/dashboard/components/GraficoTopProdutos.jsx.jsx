"use client";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "@/context/ThemeContext";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);
const cores = [
  "#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4",
  "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080"
];

export default function GraficoTopProdutos() {
  const [dados, setDados] = useState([]);
  const { tema } = useTheme();

  useEffect(() => {
    const fetchDados = async () => {
      const res = await fetch("/api/movimentacoes");
      const data = await res.json();
      setDados(data);
    };
    fetchDados();
  }, []);

  const processarDados = () => {
    const agora = new Date();
    const meses = [];

    for (let i = 5; i >= 0; i--) {
      const ref = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = ref.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
      meses.push(chave);
    }

    const vendas = dados.filter((m) => m.Tipo === "Venda");

    const agrupado = {};
    vendas.forEach((m) => {
      const [dia, mes, ano] = m.Periodo.split("/");
      const data = new Date(`${ano}-${mes}-${dia}`);
      const chaveMes = data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

      const nome = m["Nome Produto"];
      const quantidade = Number(String(m.Quantidade).replace(",", "."));

      if (!agrupado[nome]) agrupado[nome] = {};
      if (!agrupado[nome][chaveMes]) agrupado[nome][chaveMes] = 0;

      agrupado[nome][chaveMes] += quantidade;
    });

    const totais = Object.entries(agrupado).map(([nome, meses]) => {
      const total = Object.values(meses).reduce((acc, val) => acc + val, 0);
      return { nome, total };
    });

    const topProdutos = totais.sort((a, b) => b.total - a.total).slice(0, 5);

    const datasets = topProdutos.map((produto, idx) => {
      const cor = cores[idx % cores.length];
      return {
        label: produto.nome,
        data: meses.map((mes) => agrupado[produto.nome]?.[mes] || 0),
        borderColor: cor,
        backgroundColor: cor,
        tension: 0.3,
      };
    });

    return {
      labels: meses,
      datasets,
    };
  };

  return (
    <div className={`p-4 rounded shadow-md ${tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h2 className="text-lg font-bold mb-4">Top Produtos Vendidos (Últimos 6 Meses)</h2>
      <Line
        data={processarDados()}
        options={{
          responsive: true,
          layout: {
            padding: {
              top: 20,
              right: 10,
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: tema === "dark" ? "#fff" : "#000",
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
            datalabels: {
              color: tema === "dark" ? "#fff" : "#000",
              anchor: "end",
              align: "top",
              offset: 8,
              clip: false,
              font: {
                weight: "bold",
                size: 12,
              },
              formatter: (value) => value,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Quantidade Vendida",
                color: tema === "dark" ? "#fff" : "#000",
              },
              ticks: {
                color: tema === "dark" ? "#fff" : "#000",
              },
              grid: {
                color: tema === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Mês",
                color: tema === "dark" ? "#fff" : "#000",
              },
              ticks: {
                color: tema === "dark" ? "#fff" : "#000",
              },
              grid: {
                color: tema === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              },
            },
          },
        }}
      />


    </div>
  );
}
