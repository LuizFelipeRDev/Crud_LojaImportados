

## Getting Started

/dashImportados
├─ /app (Next.js 13+ usando app router)
│   ├─ /dashboard
│   │   ├─ page.tsx        ← Dashboard principal
│   │   ├─ components/
│   │   │   ├─ Sidebar.tsx
│   │   │   ├─ Navbar.tsx
│   │   │   └─ Graphs.tsx
│   │   └─ styles.css
│   ├─ /login
│   │   └─ page.tsx        ← Login page
│   └─ layout.tsx          ← Layout global (envolve ThemeProvider)
├─ /context
│   └─ ThemeContext.tsx    ← Context para modo noturno
├─ /lib
│   └─ googleSheets.ts     ← Funções CRUD no Google Sheets
├─ /public
├─ /styles
│   └─ globals.css
├─ package.json
└─ next.config.js

## Criar conta de serviço(CREDS)

🔑 Como criar a Service Account no Google Cloud

Acesse o Console do Google Cloud
👉 https://console.cloud.google.com/

No topo, confirme se está no projeto certo (o que você criou pro Sheets).

No menu lateral, vá em:
IAM e administrador → Contas de serviço.

Clique em Criar conta de serviço:

Nome: pode ser algo como sheets-service-account

ID: o console gera automaticamente

Descrição: opcional

➡️ Clique em Criar e continuar.

Permissões da conta de serviço
Aqui você pode dar a permissão "Editor" (ou só "Visualizador" se for apenas leitura).
➡️ Clique em Continuar.

Criar chave JSON
Depois que a conta for criada, clique nela e vá em:
Chaves → Adicionar chave → Criar nova chave → JSON.

Isso vai baixar um arquivo .json.
Esse é o famoso service-account.json que você vai colocar na sua pasta utils ou config do projeto.

Compartilhar a planilha com a Service Account

Abra sua planilha do Google Sheets.

Clique em Compartilhar.

Copie o e-mail gerado pela service account (algo tipo meu-projeto@meu-projeto.iam.gserviceaccount.com).

Dê permissão de Leitor (ou Editor se precisar escrever).

=---->>Explain do scope

Alguns exemplos de scopes do Google (só pra clarear):

https://www.googleapis.com/auth/spreadsheets.readonly → apenas leitura.

https://www.googleapis.com/auth/spreadsheets → leitura e escrita (esse você precisa).

https://www.googleapis.com/auth/drive → acesso geral ao Google Drive.