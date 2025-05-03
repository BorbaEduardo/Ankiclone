## 7. Páginas e Roteamento (`src/pages` e `src/App.tsx`)

As páginas definem as visualizações principais da aplicação, utilizando componentes e hooks.

### 7.1 Roteamento (`src/App.tsx`)

O componente `App.tsx` configura o roteamento principal usando `react-router-dom` e gerencia o estado de autenticação do usuário com o Supabase.

*   **Layout Principal**: Inclui a `Sidebar` e o `Toaster` para notificações.
*   **Rotas Protegidas**: A maioria das rotas (`/`, `/decks/:deckId`, `/review`, `/review/:deckId`) requer autenticação. Se o usuário não estiver logado, ele é redirecionado para `/login`.
*   **Rotas Definidas**:
    *   `/login`: Renderiza `LoginPage`.
    *   `/`: Renderiza `HomePage` (lista de baralhos).
    *   `/decks/:deckId`: Renderiza `DeckPage`, que por sua vez renderiza `DeckDetail` com o ID do baralho.
    *   `/review`: Renderiza `ReviewPage` para revisão geral.
    *   `/review/:deckId`: Renderiza `ReviewPage` para revisão de um baralho específico.

```typescript
// Trecho de App.tsx mostrando o roteamento
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ... outros imports

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... lógica de autenticação Supabase ...
  }, []);

  if (loading) {
    return <div>Carregando...</div>; // Ou um spinner melhor
  }

  return (
    <Router>
      <div className="flex min-h-screen">
        {session && <Sidebar />} {/* Mostra Sidebar se logado */}
        <main className="flex-1 p-0">
          <Routes>
            <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/" element={session ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/decks/:deckId" element={session ? <DeckPage /> : <Navigate to="/login" />} />
            <Route path="/review" element={session ? <ReviewPage /> : <Navigate to="/login" />} />
            <Route path="/review/:deckId" element={session ? <ReviewPage /> : <Navigate to="/login" />} />
            {/* Adicionar rota 404 se necessário */}
          </Routes>
        </main>
        <Toaster /> {/* Componente para exibir toasts */}
      </div>
    </Router>
  );
}
```

### 7.2 Páginas Específicas

*   **`LoginPage.tsx`**: Fornece a interface para login ou registro usando o Supabase Auth UI.
*   **`HomePage.tsx`**: **MODIFICADO**
    *   Página principal após o login.
    *   Utiliza `useDecks` para obter a lista de baralhos.
    *   Renderiza o componente `DeckList` (que agora exibe a hierarquia).
    *   Define o conteúdo e o trigger para o `Dialog` de adição de novo baralho, incluindo o **novo seletor de baralho pai**.
    *   Passa o `addDeckTrigger` como prop para `DeckList`.
*   **`DeckPage.tsx`**: Simplesmente renderiza o componente `DeckDetail`, obtendo o `deckId` dos parâmetros da URL.
*   **`ReviewPage.tsx`**: Renderiza o componente `ReviewInterface`, passando o `deckId` (se presente na URL) para permitir revisão geral ou específica do baralho.

