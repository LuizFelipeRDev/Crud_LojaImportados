"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Phone } from "lucide-react";

export default function FornecedorModal({ isOpen, onClose, fornecedorEdit, onSubmit }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  useEffect(() => {
    if (fornecedorEdit) {
      setForm({
        nome: fornecedorEdit.nome || "",
        email: fornecedorEdit.email || "",
        telefone: fornecedorEdit.telefone || "",
      });
    } else {
      setForm({ nome: "", email: "", telefone: "" });
    }
  }, [fornecedorEdit]);

  const formatTelefone = (value) => {
    // Remove tudo que não for número
    const onlyNums = value.replace(/\D/g, "");

    if (onlyNums.length <= 2) {
      return onlyNums;
    }
    if (onlyNums.length <= 7) {
      return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2)}`;
    }
    if (onlyNums.length <= 11) {
      return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7)}`;
    }
    // Limita a 11 dígitos
    return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "telefone" ? formatTelefone(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const camposObrigatorios = ["nome", "email", "telefone"];
    const faltando = camposObrigatorios.filter((c) => !form[c]);

    if (faltando.length > 0) {
      alert(`Preencha todos os campos obrigatórios: ${faltando.join(", ")}`);
      return;
    }

    const payload = fornecedorEdit?.id
      ? { id: fornecedorEdit.id, ...form }
      : form;

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-900 text-black p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold mb-4 text-black">
          {fornecedorEdit ? "Editar Fornecedor" : "Novo Fornecedor"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-black">
              <User size={16} /> Nome
            </label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full p-2 rounded border text-black"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-black">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 rounded border text-black"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-black">
              <Phone size={16} /> Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full p-2 rounded border text-black"
              placeholder="(21) 98888-4444"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            {fornecedorEdit ? "Salvar Alterações" : "Adicionar Fornecedor"}
          </button>
        </form>
      </div>
    </div>
  );
}
