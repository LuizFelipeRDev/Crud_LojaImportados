"use client";
import { Layers, Monitor, Database, FileText, Shuffle, CheckCircle, Wrench, Smartphone, BarChart3, NotebookPen } from "lucide-react";

export default function ProjetoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 py-12 px-6 md:px-12 space-y-12">

      {/* Título principal */}
      <header className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Visão Geral do Sistema
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Um sistema moderno e escalável para gerenciamento de produtos e fornecedores,
          com integração ao Google Sheets do usuário, filtros dinâmicos e relatórios em PDF.
        </p>
      </header>

      {/* Arquitetura */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-blue-400">
          <Layers className="w-6 h-6" /> Arquitetura em 3 Camadas
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/60 rounded-xl p-6 shadow hover:shadow-lg transition">
            <Monitor className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold">Frontend – Dashboard Web</h3>
            <p className="text-gray-400 text-sm mt-2">
              Interface intuitiva construída em React/Next.js, com tabelas de produtos,
              filtros dinâmicos e indicadores de estoque.
            </p>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-6 shadow hover:shadow-lg transition">
            <Shuffle className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold">Backend / API</h3>
            <p className="text-gray-400 text-sm mt-2">
              Processa requisições, integra com o Google Sheets, aplica filtros e gera relatórios PDF.
            </p>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-6 shadow hover:shadow-lg transition">
            <Database className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold">Banco de Dados – Google Sheets</h3>
            <p className="text-gray-400 text-sm mt-2">
              Armazena produtos, fornecedores e movimentações em tempo real com baixo custo e alta acessibilidade.
            </p>
          </div>
        </div>
      </section>

      {/* Relatórios PDF */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-green-400">
          <NotebookPen className="w-6 h-6" /> Registro e Controle
        </h2>
        <p className="text-gray-300 max-w-3xl">
          O sistema permite registrar produtos com sua <span className="font-semibold text-white">classificação detalhada</span>,
          garantindo organização desde a entrada. Cada item conta com controle de estoque em tempo real,
          permitindo acompanhar todas as movimentações de <span className="font-semibold text-white">compra e venda</span>.
          Além disso, é possível cadastrar e consultar fornecedores, mantendo <span className="font-semibold text-white">dados completos de contato e histórico</span>
          para gestão eficiente do fluxo de mercadorias.
        </p>
      </section>
      {/* Relatórios PDF */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-purple-400">
          <FileText className="w-6 h-6" /> Relatórios em PDF
        </h2>
        <p className="text-gray-300 max-w-3xl">
          Após aplicar filtros no dashboard, o usuário pode gerar relatórios em PDF com resumo dos produtos,
          informações de fornecedores, status de estoque e data/hora. Layout limpo e pronto para impressão ou envio.
        </p>
      </section>

      {/* Fluxo de dados */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-green-400">
          <Shuffle className="w-6 h-6" /> Fluxo de Dados
        </h2>
        <p className="text-gray-300 max-w-3xl">
          O sistema conecta as planilhas do Google Sheets ao backend e ao dashboard web, garantindo que os dados estejam sempre atualizados e disponíveis em tempo real.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/60 p-4 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 flex items-center gap-3">
            <span className="text-xl">📥</span>
            <div>
              <p className="text-white font-medium">Google Sheets → Backend</p>
              <p className="text-gray-300 text-sm">O backend consulta os dados atualizados das planilhas.</p>
            </div>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 flex items-center gap-3">
            <span className="text-xl">📤</span>
            <div>
              <p className="text-white font-medium">Backend → Frontend</p>
              <p className="text-gray-300 text-sm">O dashboard recebe os dados para exibição em tempo real.</p>
            </div>
          </div>

          <div className="bg-gray-800/60 p-4 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 flex items-center gap-3">
            <span className="text-xl">🔎</span>
            <div>
              <p className="text-white font-medium">Frontend → Backend</p>
              <p className="text-gray-300 text-sm">Usuário aplica filtros, e o frontend envia novas requisições ao backend.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
          <CheckCircle className="w-6 h-6" /> Funcionalidades-Chave
        </h2>
        <ul className="grid md:grid-cols-2 gap-4 text-gray-300">
          <li>✅ Filtros por fornecedor e categoria</li>
          <li>✅ Ordenação de produtos por nome, status ou estoque</li>
          <li>✅ Indicadores visuais de disponibilidade</li>
          <li>✅ Relatórios PDF para reuniões e auditorias</li>
        </ul>
      </section>

      {/* Roadmap */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-pink-400">
          <Wrench className="w-6 h-6" /> Roadmap do Projeto
        </h2>
        <div className="relative border-l-2 border-gray-700 pl-6 space-y-8">

          <div className="flex items-start gap-4">
            <CheckCircle className="text-green-500 w-6 h-6 mt-1" />
            <div>
              <h3 className="font-semibold">Memoria de Cálculo</h3>
              <p className="text-gray-400 text-sm">Assim como relatório analitico algumas funções novas terão memória de cálculo.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Smartphone className="text-blue-400 w-6 h-6 mt-1 animate-pulse" />
            <div>
              <h3 className="font-semibold">Responsividade Mobile</h3>
              <p className="text-gray-400 text-sm">Em desenvolvimento para adaptar o dashboard a telas menores.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <BarChart3 className="text-purple-400 w-6 h-6 mt-1 animate-bounce" />
            <div>
              <h3 className="font-semibold">Mais Relatórios PDF</h3>
              <p className="text-gray-400 text-sm">Planejado: relatórios personalizados, e registros de clientes.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Conclusão */}
      <footer className="text-center pt-8 border-t border-gray-700">
        <p className="text-gray-400 max-w-2xl mx-auto">
          Este sistema foi projetado para ser uma solução enxuta, escalável e prática,
          ideal para empresas que precisam gerenciar produtos e fornecedores sem depender
          de plataformas caras ou complexas.
        </p>
      </footer>
    </div>
  );
}
