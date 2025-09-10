"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ProdutoModal({ isOpen, onClose, onSubmit, produtoEdit }) {
  const [form, setForm] = useState({
    Nome: "",
    Aliquota: "",
    Categoria: "",
    Marca: "",
    Unidade: "",
    ID: null,
  });


  useEffect(() => {
    if (produtoEdit) {
      // Preenche o formulário com os dados do produto a ser editado
      setForm({
        ...produtoEdit
      });
    } else {
      setForm({
        Nome: "",
        Aliquota: "",
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
    onSubmit(form); // envia todos os campos para o pai
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md relative">
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

          <input
            placeholder="Alíquota (%)"
            name="Aliquota"
            type="number"
            value={form.Aliquota}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            required
          />

          <input
            placeholder="Categoria"
            name="Categoria"
            value={form.Categoria}
            onChange={handleChange}
            className="w-full p-2 rounded border"
            required
          />

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



          {/* Botões Ativo/Não */}
          <div className="flex gap-4">
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
