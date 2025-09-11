"use client";

import React from "react";
import { X, Edit } from "lucide-react";

export default function FornecedorTable({ fornecedores, onEditar, onExcluir }) {
if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
  return <p className="text-gray-500">Nenhum fornecedor cadastrado.</p>;
}


  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr className="text-black">
            <th className="p-3 border-b">ID</th>
            <th className="p-3 border-b">Nome</th>
            <th className="p-3 border-b">Email</th>
            <th className="p-3 border-b">Telefone</th>
            <th className="p-3 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor, idx) => (
            <tr
              key={idx}
              className="text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hover:text-gray-700"
            >
              <td className="p-2 border-b">{fornecedor.id}</td>
              <td className="p-2 border-b">{fornecedor.nome}</td>
              <td className="p-2 border-b">{fornecedor.email || "-"}</td>
              <td className="p-2 border-b">{fornecedor.telefone || "-"}</td>
              <td className="p-2 border-b">
                <div className="flex justify-center items-center gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    onClick={() => onEditar(fornecedor)}
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    onClick={() => onExcluir(fornecedor.id)}
                  >
                    <X size={16} /> Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
