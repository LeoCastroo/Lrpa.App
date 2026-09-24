# LRPA — Portal (Lrpa.App)

Frontend do portal de importações da LCS. O usuário do escritório faz login, vê
apenas os serviços a que tem acesso, lista as importações do seu escritório e
envia planilhas XLSX validadas contra um layout fixo.

## Stack

- React 19 + Vite 7 + TypeScript
- React Router 7, Zustand 5 (persist), Zod 4
- Axios com interceptors (token + refresh automático)
- Tailwind CSS 4 + Radix UI (padrão shadcn), TanStack Table, Sonner

## Setup

```bash
npm install
npm run dev       # http://localhost:9000 (proxy para a API em http://localhost:3001)
npm run build     # build de produção em dist/
```

- Dev usa a API local em `http://localhost:3001` (via `process.env.NODE_ENV`).
- Em produção (`NODE_ENV=production`), a base URL vem de `src/service/api.ts`
  (`APP_ENV` define o prefixo). **Ajuste o domínio de produção** nesse arquivo.

## Estrutura

```
src/
├── api/                  # user, services, imports (+ Pagination)
├── components/
│   ├── app-sidebar.tsx   # navegação dinâmica pelos serviços permitidos
│   ├── login-form.tsx    # login → /me → services.fetch()
│   ├── nav-main/nav-user
│   ├── imports/          # componentes de domínio (dropzone, layout, erros, banners)
│   └── ui/               # shadcn
├── hooks/                # use-service (guard), use-upload-window, use-theme
├── lib/                  # download (blob autenticado), import-status
├── pages/
│   ├── home/             # cards dos serviços permitidos
│   ├── account/          # dados + tema
│   └── services/imports/ # lista / new (upload) / details — GENÉRICAS por serviço
├── service/              # api.ts (axios), authentication.ts, types/
└── store/                # user (persist), services (sessão), generics
```

As páginas de serviço são **genéricas**: o layout esperado (colunas), o modelo
para download e a navegação vêm da definição do serviço retornada pela API —
novos serviços aparecem sem código novo.

## Fluxo

Login → `/me` popula o usuário e `GET /services` popula a sidebar → o usuário
abre um serviço, vê a lista de importações e cria uma nova enviando a planilha.
A tela de nova importação mostra o layout esperado, o botão de download do
modelo, avisa sobre a janela 08h–18h e sobre a substituição do envio do dia, e
exibe os erros de validação por linha quando a planilha está fora do padrão.
