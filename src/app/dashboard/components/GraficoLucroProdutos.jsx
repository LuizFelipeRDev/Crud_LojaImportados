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

const cores = [
  "#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4",
  "#46f0f0", "#f032e6", "#bcf60c", "#fabebe", "#008080",
  "#ffd8b1", "#000075", "#aaffc3", "#808000", "#ffe119"
];

export default function GraficoLucroProdutos() {
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
    const produtos = {};

    dados.forEach((m) => {
      const nome = m["Nome Produto"];
      const tipo = m.Tipo;
      const valor = Number(String(m["ValorUnitario"]).replace(",", "."));
      const quantidade = Number(String(m.Quantidade).replace(",", "."));

      if (!produtos[nome]) {
        produtos[nome] = {
          compras: [],
          vendas: [],
          quantidadeVendida: 0,
        };
      }

      if (tipo === "Compra") {
        produtos[nome].compras.push(valor);
      } else if (tipo === "Venda") {
        produtos[nome].vendas.push(valor);
        produtos[nome].quantidadeVendida += quantidade;
      }
    });

    const lucroPorProduto = Object.entries(produtos).map(([nome, dados]) => {
      const mediaCompra =
        dados.compras.length > 0
          ? dados.compras.reduce((a, b) => a + b, 0) / dados.compras.length
          : 0;
      const mediaVenda =
        dados.vendas.length > 0
          ? dados.vendas.reduce((a, b) => a + b, 0) / dados.vendas.length
          : 0;

      const lucroUnitario = mediaVenda - mediaCompra;
      const lucroTotal = lucroUnitario * dados.quantidadeVendida;

      return { nome, lucroTotal };
    });

    const topProdutos = lucroPorProduto
      .filter(p => p.lucroTotal > 0)
      .sort((a, b) => b.lucroTotal - a.lucroTotal)
      .slice(0, 10);

    return {
      labels: topProdutos.map(p => p.nome),
      datasets: [
        {
          label: "Lucro Estimado (R$)",
          data: topProdutos.map(p => p.lucroTotal.toFixed(2)),
          backgroundColor: topProdutos.map((_, i) => cores[i % cores.length]),
        },
      ],
    };
  };

  return (
    <div className={`p-4 rounded shadow-md ${tema === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h2 className="text-lg font-bold mb-4">Top Produtos por Lucro</h2>
      
      <div className="">
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
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `R$ ${ctx.raw}`,
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
                text: "Lucro Estimado (R$)",
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
                text:"",
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
      
    </div>
  );
}
