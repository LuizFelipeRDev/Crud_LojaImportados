"use client";
import { useEffect, useState } from "react";



export default function TabelaMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/movimentacoes");
      const data = await res.json();
      setMovimentacoes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  // helpers
  const parseDecimalBR = (v) => {
    if (v == null) return 0;
    // remove separador de milhar e troca vírgula por ponto
    return Number(String(v).replace(/\./g, "").replace(",", "."));
  };

  const formatBR = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return "0,00";
    return x.toFixed(2).replace(".", ",");
  };


  if (loading) return <p>Carregando movimentações...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="border-b p-2">ID</th>
            <th className="border-b p-2">Produto</th>
            <th className="border-b p-2">Quantidade</th>
            <th className="border-b p-2">Valor Unitário</th>
            <th className="border-b p-2">Valor Total</th>
            <th className="border-b p-2">Período</th>
            <th className="border-b p-2">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {movimentacoes.map((m, idx) => {
            const valorUnitarioNum = parseDecimalBR(m.ValorUnitario);
            const valorTotalNum = parseDecimalBR(m["Valor Total"]);

            return (
              <tr key={m["ID Produto"] ?? idx} className="text-center hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="border-b p-2">{m["ID Produto"]}</td>
                <td className="border-b p-2">{m["Nome Produto"]}</td>
                <td className="border-b p-2">{m.Quantidade}</td>
                <td className="border-b p-2">{formatBR(valorUnitarioNum)}</td>
                <td className="border-b p-2">{formatBR(valorTotalNum)}</td>
                <td className="border-b p-2">{m.Periodo}</td>
                <td className="border-b p-2">{m["Tipo"]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>




    </div>
  );
}
