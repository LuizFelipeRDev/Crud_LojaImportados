"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ProdutoModal({ isOpen, onClose, onSubmit, produtoEdit }) {
  const [form, setForm] = useState({
    Nome: "",
    Fornecedores: "",
    Categoria: "",
    Marca: "",
    Unidade: "",
    Ativo: "Sim",
    ID: null,
  });

  const [fornecedores, setFornecedores] = useState([]);

  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const res = await fetch("/api/fornecedores");
        const data = await res.json();
        setFornecedores(data);
      } catch (err) {
        console.error("Erro ao buscar fornecedores:", err);
      }
    };

    fetchFornecedores();
  }, []);

useEffect(() => {
  if (produtoEdit) {
    setForm({
      Nome: produtoEdit.Nome ?? "",
      Fornecedores: produtoEdit.Fornecedores ?? "",
      Categoria: produtoEdit.Categoria ?? "",
      Marca: produtoEdit.Marca ?? "",
      Unidade: produtoEdit.Unidade ?? "",
      Ativo: produtoEdit.Ativo ?? "Sim",
      ID: produtoEdit.ID ?? null,
    });
  } else {
    setForm({
      Nome: "",
      Fornecedores: "",
      Categoria: "",
      Marca: "",
      Unidade: "",
      Ativo: "Sim",
      ID: null,
    });
  }
}, [produtoEdit]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAtivoChange = (value) => {
    setForm({ ...form, Ativo: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  if (!isOpen) return null;

  const categorias = [
    "PCs", "Games", "Monitor", "Notebooks", "Roupas", "Livros", "Cadernos",
    "Tablets", "Celulares", "Fones", "Relógios", "Ventilador", "Acessórios", "Eletros"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded text-black shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4">{produtoEdit ? "Editar Produto" : "Novo Produto"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">

          <div>ID: {produtoEdit ? form.ID : "Será gerado automaticamente"}</div>

          <input
            placeholder="Nome"
            name="Nome"
            value={form.Nome}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            required
          />

          <select
            name="Fornecedores"
            value={form.Fornecedores}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            required
          >
            <option value="">Selecione um fornecedor</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </select>


          <select
            name="Categoria"
            value={form.Categoria}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            placeholder="Marca"
            name="Marca"
            value={form.Marca}
            onChange={handleChange}
            className="w-full p-2 rounded border"
          />

          <input
            placeholder="Unidade"
            name="Unidade"
            value={form.Unidade}
            onChange={handleChange}
            className="w-full p-2 rounded border"
          />

          <div className="flex gap-4">
            <p>Ativo: </p>
            <label className={`cursor-pointer ${form.Ativo === "Sim" ? "font-bold" : ""}`}>
              <input
                type="radio"
                name="Ativo"
                value="Sim"
                checked={form.Ativo === "Sim"}
                onChange={() => handleAtivoChange("Sim")}
              /> Sim
            </label>
            <label className={`cursor-pointer ${form.Ativo === "Não" ? "font-bold" : ""}`}>
              <input
                type="radio"
                name="Ativo"
                value="Não"
                checked={form.Ativo === "Não"}
                onChange={() => handleAtivoChange("Não")}
              /> Não
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded mt-2"
          >
            {produtoEdit ? "Salvar Alterações" : "Adicionar Produto"}
          </button>
        </form>
      </div>
    </div>
  );
}
