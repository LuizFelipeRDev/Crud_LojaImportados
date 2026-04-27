# Lue Importados - Sistema de Gestão

**LINK DE ACESSO**
--> https://07-dash-importados.vercel.app/login

## 📖 Descrição

Sistema web fullstack para gestão de loja de importados, permitindo o controle de produtos, fornecedores, movimentações (compras e vendas) e geração de relatórios. O projeto utiliza o Google Sheets como banco de dados, oferecendo uma solução de baixo custo para armazenamento e acesso aos dados.

## 🚀 Funcionalidades

### Gestão de Produtos
- Cadastro, edição e exclusão de produtos
- Campos: Nome, Fornecedor, Categoria, Marca, Unidade (quantidade em estoque), Ativo

### Gestão de Fornecedores
- Cadastro, edição e exclusão de fornecedores
- Campos: Nome, E-mail, Telefone
- Bloqueio de exclusão quando existem produtos vinculados

### Movimentações
- Registro de compras e vendas
- Atualização automática do estoque
- Validação de estoque suficiente para vendas

### Dashboard
- Resumo do inventário (quantidade total de produtos)
- Gráficos de movimentações (compras vs vendas)
- Top produtos mais movimentados
- Lucro por produto
- Estoque por categoria (gráfico de pizza)
- Estoque por marca

### Relatórios
- Produtos por fornecedor
- Resumo de produtos
- Lucro por produto
- Movimentações por produto
- Vendas por produto
- Estoque geral

### Recursos Adicionais
- Tema claro/escuro
- Interface com animações (Framer Motion)
- Geração de PDFs dos relatórios
- Acesso autenticado

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19.1.0 com Next.js 15.5.2 (App Router)
- **Estilização**: Tailwind CSS 4
- **Gráficos**: Chart.js + react-chartjs-2 + chartjs-plugin-datalabels
- **Banco de Dados**: Google Sheets API (googleapis)
- **PDF**: jspdf + jspdf-autotable
- ** Ícones**: Lucide React
- **Animações**: Framer Motion
- **Datas**: date-fns
- **Datas (UI)**: react-date-range
- **Autenticação**: bcryptjs (para hash de senhas)

## 📂 Estrutura do Projeto

```
├── src/
│   └── app/
│       ├── dashboard/              # Área autenticada
│       │   ├── componentes/      # Componentes reutilizáveis (gráficos)
│       │   ├── fornecedores/     # Gestão de fornecedores
│       │   ├── lib/             # Integração com Google Sheets
│       │   ├── movimentacoes/   # Registro de compras/vendas
│       │   ├── produtos/       # Gestão de produtos
│       │   ├── relatorios/     # Relatórios e PDFs
│       │   └── page.jsx         # Dashboard principal
│       ├── api/                 # Rotas da API
│       │   ├── produtos/       # API de produtos
│       │   ├── fornecedores/    # API de fornecedores
│       │   └── movimentacoes/   # API de movimentações
│       ├── components/         # Componentesglobais
│       ├── context/            # Contextos (ThemeContext)
│       ├── login/              # Página de login
│       └── globals.css        # Estilos globais
├── public/                     # Arquivos estáticos
└── package.json
```

## ⚙️ Como Rodar o Projeto

### 1. Pré-requisitos
- Node.js 18+ instalado
- Conta Google com acesso ao Google Sheets
- Projeto do Google Cloud configurado


### 2. Configuração do Banco de Dados (Google Sheets)

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a API Google Sheets
3. Crie uma conta de serviço e baixe o arquivo JSON das credenciais
4. Compartilhe uma planilha Google Sheets com o e-mail da conta de serviço (como editor)

A planilha deve conter as seguintes abas (sheets):
- **Produtos**: ID, Nome, Fornecedores, Categoria, Marca, Unidade, Ativo
- **Fornecedores**: ID, Nome, E-mail, Telefone
- **Movimentacoes**: ID Produto, Nome Produto, Quantidade, Valor Unitário, Valor Total, Período, Tipo, Mov ID

### 3. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

### 4. Instalação e Execução

```bash
# Instalação das dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.

### 5. Credenciais de Acesso

- **Usuário**: admin
- **Senha**: admin

## 🔌 Configuração

### Variável de Ambiente Obrigatória

| Variável | Descrição |
|---------|-----------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Credenciais JSON da conta de serviço do Google Cloud |

### Estrutura da Planilha

O sistema espera uma planilha com三个 abas:

1. **Produtos** (colunas A-G)
   - ID, Nome, Fornecedores, Categoria, Marca, Unidade, Ativo

2. **Fornecedores** (colunas A-D)
   - ID, Nome, E-mail, Telefone

3. **Movimentacoes** (colunas A-H)
   - ID Produto, Nome Produto, Quantidade, Valor Unitário, Valor Total, Período, Tipo, Mov ID

## 📊 Exemplos de Uso

### Adicionar Produto (via API)
```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"Nome":"iPhone 15","Fornecedores":"Apple","Categoria":"Eletrônicos","Marca":"Apple","Unidade":10,"Ativo":"Sim"}'
```

### Registrar Movimentação (Compra)
```json
{
  "NomeProduto": "iPhone 15",
  "ValorUnitario": 4500,
  "Quantidade": 5,
  "Periodo": "2024-01-15",
  "Movimentacao": "Compra"
}
```

### Registrar Movimentação (Venda)
```json
{
  "NomeProduto": "iPhone 15",
  "ValorUnitario": 5500,
  "Quantidade": 2,
  "Periodo": "2024-01-20",
  "Movimentacao": "Venda"
}
```

## 🧪 Testes

O projeto não possui suíte de testes automática configurada. Para verificar o funcionamento:

1. Inicie o servidor com `npm run dev`
2. Faça login com as credenciais padrão (admin/admin)
3. Teste as funcionalidades de CRUD nas páginas de gestão

## 📌 Observações

- **Segurança**: O sistema utiliza autenticação simples (hardcoded). Para produção, recomenda-se implementar autenticação mais robusta com NextAuth.js ou similar.
- **Responsividade**: O projeto foi otimizado para desktop. Em dispositivos móveis, alguns componentes podem não renderizar adequadamente.
- **Banco de Dados**: O Google Sheets possui limitações de escrita simultânea. Evite múltiplas operações concorrentes na mesma planilha.
- **API Key**: Mantenha as credenciais da conta de serviço em sigilo. Nunca commit o arquivo `.env.local` no Git.

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir este código.

---

