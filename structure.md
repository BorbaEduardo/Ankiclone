## 2. Estrutura do Projeto

A estrutura do projeto React (criado com Vite e o template `shadcn/ui`) segue um padrão comum, organizado para separar lógica, componentes, estilos e tipos:

```
anki-clone-app/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes shadcn/ui (Button, Card, Dialog, etc.)
│   │   │   └── sidebar.tsx # Componente customizado da Sidebar
│   │   ├── Card/
│   │   │   └── CardDisplay.tsx # Exibe um único cartão (frente/verso)
│   │   ├── Deck/
│   │   │   ├── DeckDetail.tsx  # Detalhes de um baralho (lista de cartões, add card)
│   │   │   └── DeckList.tsx    # Lista hierárquica de baralhos
│   │   └── Review/
│   │       └── ReviewInterface.tsx # Interface principal de revisão
│   ├── hooks/
│   │   ├── useCards.ts     # Hook para gerenciar cartões de um baralho
│   │   ├── useDecks.ts     # Hook para gerenciar baralhos (agora com hierarquia)
│   │   └── useReview.ts    # Hook para gerenciar a lógica da sessão de revisão
│   ├── lib/
│   │   ├── supabaseClient.ts # Configuração do cliente Supabase
│   │   ├── srs.ts          # Lógica do algoritmo SRS (SM-2)
│   │   ├── utils.ts        # Utilitários (ex: cn para classnames)
│   │   └── deckUtils.ts    # **NOVO:** Utilitários para hierarquia de baralhos (ex: breadcrumbs)
│   ├── pages/
│   │   ├── DeckPage.tsx    # Página wrapper para DeckDetail
│   │   ├── HomePage.tsx    # Página inicial (lista de baralhos)
│   │   ├── LoginPage.tsx   # Página de login/registro
│   │   └── ReviewPage.tsx  # Página wrapper para ReviewInterface
│   ├── App.tsx           # Componente principal, define rotas e layout
│   ├── index.css         # Estilos globais (Tailwind)
│   ├── main.tsx          # Ponto de entrada da aplicação React
│   └── types.ts          # Definições de tipos TypeScript
├── .env                # Variáveis de ambiente (Supabase URL/Key)
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

**Principais Diretórios:**

*   **`src/components`**: Contém os componentes reutilizáveis da interface do usuário, divididos por funcionalidade (Card, Deck, Review) e a subpasta `ui` para componentes base (gerados pelo `shadcn/ui` e customizados).
*   **`src/hooks`**: Armazena hooks React customizados para encapsular lógica de estado e interações com o backend (Supabase), como buscar dados, adicionar, excluir, etc.
*   **`src/lib`**: Utilitários gerais, configuração do cliente Supabase, lógica de negócios (SRS) e funções auxiliares (como `deckUtils`).
*   **`src/pages`**: Componentes que representam páginas completas da aplicação, geralmente combinando vários componentes menores e hooks.
*   **`src/`**: Raiz do código-fonte, contendo o ponto de entrada (`main.tsx`), o componente principal (`App.tsx`), estilos globais (`index.css`) e tipos (`types.ts`).

