"use client";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "@/context/ThemeContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function GraficoMovimentacoes() {
  const [dados, setDados] = useState([]);
  const { tema } = useTheme(); // ✅ pega o tema atual

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

    for (let i = 2; i >= 0; i--) {
      const ref = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = ref.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
      meses.push(chave);
    }

    const resumo = {};
    meses.forEach((mes) => {
      resumo[mes] = { Compra: 0, Venda: 0 };
    });

    dados.forEach((m) => {
      const [dia, mes, ano] = m.Periodo.split("/");
      const data = new Date(`${ano}-${mes}-${dia}`);
      const chaveMes = data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

      if (resumo[chaveMes]) {
        const valor = Number(String(m["Valor Total"]).replace(",", "."));
        resumo[chaveMes][m.Tipo] += valor;
      }
    });

    return {
      labels: meses,
      datasets: [
        {
          label: "Compras",
          data: meses.map((mes) => resumo[mes].Compra),
          backgroundColor: "#1f77b4",
        },
        {
          label: "Vendas",
          data: meses.map((mes) => resumo[mes].Venda),
          backgroundColor: "#ff7f0e",
        },
      ],
    };
  };

  return (
    <div className={`p-4 rounded shadow-md ${tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h2 className="text-lg font-bold mb-4">Movimentações por Mês</h2>
      <Bar
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
              callbacks: {
                label: ctx => `R$ ${ctx.raw.toFixed(2)}`,
              },
            },
            datalabels: {
              color: tema === "dark" ? "#fff" : "#000",
              anchor: "end",
              align: "top",
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
                text: "Valor (R$)",
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
