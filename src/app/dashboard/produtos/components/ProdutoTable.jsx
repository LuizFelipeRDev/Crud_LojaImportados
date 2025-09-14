"use client";

import React from "react";
import { Edit, FileQuestion, Trash2 } from "lucide-react";

export default function ProdutoTable({ produtos, onEditar, onExcluir }) {
  if (!produtos || produtos.length === 0) {
    return <div className="flex flex-col items-center gap-2"><FileQuestion className="w-12 h-12 mb-2" /> <p className="text-gray-500">Nenhum produto cadastrado.</p> </div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr className="text-black">
            <th className="p-3 border-b">ID</th>
            <th className="p-3 border-b">Nome</th>
            <th className="p-3 border-b">Fornecedores</th>
            <th className="p-3 border-b">Categoria</th>
            <th className="p-3 border-b">Marca</th>
            <th className="p-3 border-b">Unidade</th>
            <th className="p-3 border-b">Ativo</th>
            <th className="p-3 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto, idx) => (
            <tr
              key={idx}
              className="text-center hover:bg-gray-100 transition-colors hover:text-gray-700"
            >
              <td className="p-2 border-b">{produto.ID}</td>
              <td className="p-2 border-b">{produto.Nome}</td>
              <td className="p-2 border-b">{produto.Fornecedores}</td>
              <td className="p-2 border-b">{produto.Categoria}</td>
              <td className="p-2 border-b">{produto.Marca || "-"}</td>
              <td className="p-2 border-b">
                <span className={Number(produto.Unidade) === 0 ? "text-red-600" : "dark"}>
                  {produto.Unidade || "-"}
                </span>
              </td>
              <td className="p-2 border-b">
                {produto.Ativo === "Sim" ? (
                  <span className="text-green-600 font-bold">Sim</span>
                ) : (
                  <span className="text-red-600 font-bold">Não</span>
                )}
              </td>
              <td className="p-2 border-b">
                <div className="flex justify-center items-center gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 flex items-center gap-1 font-semibold"
                    onClick={() => {
                      onEditar(produto);
                    }}

                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold"
                    onClick={() => onExcluir(produto.ID)}
                  >
                    <Trash2 size={18} /> Excluir
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
