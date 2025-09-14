"use client";
import React, { useState } from "react";

// Componentes reais
import ProdutosPorFornecedor from "./components/ProdutosPorFornecedor";
import Estoque from "./components/Estoque";
import VendasPorMovimento from "./components/VendasPorProduto";
import ComprasPorMovimento from "./components/ComprasPorProduto";

// Lucide Icons
import { Newspaper, Box, DollarSign, ShoppingCart, BarChart, FileText } from "lucide-react";
import Spinner from "@/app/components/Spinner";
import RelatorioResumoProdutos from "./components/RelatorioResumoProdutos";

// Componentes fake
const LucroPorProduto = () => <div className="p-4 border rounded">Pré-visualização: Lucro por Produto</div>;
const FakeRelatorio = ({ nome }) => <div className="p-4 border rounded">Pré-visualização: {nome}</div>;

export default function RelatoriosPage() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [relatorioSelecionado, setRelatorioSelecionado] = useState("");

  // Categorias e relatórios
  const categorias = {
    "Gerencial": ["Produtos por Fornecedor", "Estoque"],
    "Financeiro": ["Compras Por Movimento", "Vendas Por Movimento"],
    "Outros": ["Resumo Geral Produtos"]
  };

  // Mapeia nomes de relatório para componentes
  const componentes = {
    "Produtos por Fornecedor": <ProdutosPorFornecedor />,
    "Estoque": <Estoque />,
    "Compras Por Movimento": <ComprasPorMovimento />,
    "Vendas Por Movimento": <VendasPorMovimento />,
    "Lucro por Produto": <LucroPorProduto />,
    "Resumo Geral Produtos": <RelatorioResumoProdutos />,
  };

  // Mapeia nomes de relatório para ícones
  const icones = {
    "Produtos por Fornecedor": ShoppingCart,
    "Estoque": Box,
    "Compras Por Movimento": DollarSign,
    "Vendas Por Movimento": BarChart,
    "Lucro por Produto": DollarSign,
    "Resumo Geral Produtos": Newspaper,
  };

  // Função única de voltar
  const handleVoltar = () => {
    if (relatorioSelecionado) {
      setRelatorioSelecionado("");
    } else if (categoriaSelecionada) {
      setCategoriaSelecionada("");
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex gap-2 items-center justify-center w-full border-2 py-2 rounded-2xl">
        <Newspaper />
        <h1 className="text-2xl font-bold">Relatórios</h1>
      </div>

      {/*========BOTÃO VOLTAR ÚNICO=========== */}
      {(categoriaSelecionada || relatorioSelecionado) && (
        <button
          className="absolute bottom-[189.8px] right-[30px] px-4 py-2 bg-red-500 text-white hover:bg-red-400 rounded btnReport"
          onClick={handleVoltar}
        >
          Voltar
        </button>
      )}

      {/*========MENU=========== */}
      <div className={`rounded-2xl h-40 ${!relatorioSelecionado ? "border-2 dark:border-gray-700" : ""}`}>

        {/* Passo 1: Seleção da categoria */}
        {!categoriaSelecionada && (
          <div className="flex flex-col items-center space-y-4 mt-4">
            <p className=" text-lg font-semibold">Selecione uma categoria de relatório</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {Object.keys(categorias).map(cat => (
                <button
                  key={cat}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setCategoriaSelecionada(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Passo 2: Seleção do relatório dentro da categoria */}
        {categoriaSelecionada && !relatorioSelecionado && (
          <div className="flex flex-col items-center space-y-4 mt-4">
            <p className=" text-lg font-semibold">Categoria: {categoriaSelecionada}</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {categorias[categoriaSelecionada].map(rel => {
                const Icon = icones[rel];
                return (
                  <button
                    key={rel}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                    onClick={() => setRelatorioSelecionado(rel)}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Passo 3: Pré-visualização do relatório */}
        {categoriaSelecionada && relatorioSelecionado && (
          <div className="flex justify-between items-center">
            <div className="flex w-full relative">
              {componentes[relatorioSelecionado]}
            </div>
          </div>
        )}

        {/* Mensagem centralizada caso nada esteja selecionado */}
        
        {!relatorioSelecionado && (
          <div className="flex flex-col justify-center items-center h-40 text-gray-400 gap-2 mt-16">
            <FileText size={60}/> <p>Nenhum relatório selecionado</p>
    
          </div>
        )}

      </div>
    </div>
  );
}
