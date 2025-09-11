"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ModalMovimentacoes({ isOpen, onClose, onSubmit, onError }) {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({
    NomeProduto: "",
    Quantidade: "",
    ValorUnitario: "",
    Periodo: "",
    Movimentacao: "Compra",
  });

const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/produtos")
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const valorUnitarioNumerico = Number(form.ValorUnitario.replace(",", "."));
  const quantidadeNumerica = Number(form.Quantidade);
  const valorTotal = quantidadeNumerica && valorUnitarioNumerico
    ? quantidadeNumerica * valorUnitarioNumerico
    : 0;

 const handleSubmit = (e) => {
  e.preventDefault();

  const camposObrigatorios = ["NomeProduto", "Quantidade", "ValorUnitario", "Periodo", "Movimentacao"];
  const faltando = camposObrigatorios.filter(c => !form[c]);

  if (faltando.length > 0) {
    onError?.(`Preencha todos os campos obrigatórios: ${faltando.join(", ")}`);
    return;
  }

  onSubmit({
    ...form,
    ValorUnitario: valorUnitarioNumerico,
    ValorTotal: valorTotal,
  });

  onClose();
};



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 text-black p-6 rounded-lg shadow-lg w-96 relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4 text-black">Nova Movimentação</h3>
        <form onSubmit={handleSubmit} className="space-y-3">

          <label className="text-black">Produto</label>
          <select
            name="NomeProduto"
            value={form.NomeProduto}
            onChange={handleChange}
            className="w-full p-2 rounded border text-black"
            required
          >
            <option value="">Selecione o produto</option>
            {produtos
              .filter(p => p.Ativo !== "Não")
              .map(p => (
                <option key={p.ID} value={p.Nome}>{p.Nome}</option>
              ))}
          </select>

          <input
            type="number"
            name="Quantidade"
            placeholder="Quantidade"
            value={form.Quantidade}
            onChange={(e) => {
              const valor = e.target.value.replace(/[^\d]/g, "");
              setForm({ ...form, Quantidade: valor });
            }}
            className="w-full p-2 rounded border text-black"
            required
          />

          <input
            type="text"
            name="ValorUnitario"
            placeholder="Valor Unitário"
            value={form.ValorUnitario}
            onChange={(e) => {
              let valor = e.target.value.replace(/\D/g, "");
              if (valor.length < 3) {
                valor = valor.padStart(3, "0");
              }
              const reais = valor.slice(0, -2);
              const centavos = valor.slice(-2);
              const formatado = `${Number(reais)},${centavos}`;
              setForm({ ...form, ValorUnitario: formatado });
            }}
            className="w-full p-2 rounded border"
            required
          />

          <p className="font-bold">
            Valor Total: R$ {valorTotal.toFixed(2).replace(".", ",")}
          </p>

          <input
            type="date"
            name="Periodo"
            value={form.Periodo}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            required
          />

          <select
            name="Movimentacao"
            value={form.Movimentacao}
            onChange={handleChange}
            className="w-full p-2 rounded border"
          >
            <option value="Compra">Compra</option>
            <option value="Venda">Venda</option>
            <option value="Ajuste">Ajuste</option>
          </select>

          <button type="submit"  disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
            Adicionar Movimentação
          </button>
        </form>
      </div>
    </div>
  );
}
