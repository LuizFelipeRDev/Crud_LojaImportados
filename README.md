
>  **LINK DA APLICAÇÂO:**  
> (https://07-dash-importados.vercel.app/login)

## ESTRUTURA

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


## DASHBOARD FULLSTACK

projeto nextReack > API REST < GOOGLESHEET(banco de dados)

-Dashboard com  6 painneis para analise
-Cadastre novos produtos
-Cadastre Fornecedores
-Faça movimentações de compra e venda
-Gere diversos relatorios gerenciais,analiticos com memoria de calculo, financeiro, etc com geraração em PDF

![alt text](image-1.png)

![alt text](image-2.png)

![alt text](image-3.png)

## ESTRUTURA DO PROJETO

![alt text](image-4.png)
