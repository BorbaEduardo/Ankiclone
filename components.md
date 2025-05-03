## 5. Componentes React (`src/components`)

Os componentes são organizados por funcionalidade e reutilização.

### 5.1 Componentes de UI (`src/components/ui`)

Este diretório contém componentes base, a maioria gerada pelo `shadcn/ui` e customizada conforme necessário:

*   **Componentes `shadcn/ui`**: `Button`, `Card`, `Dialog`, `Input`, `Select`, `Toast`, `Toaster`, `AlertDialog`, `Skeleton`, `Progress`, `Breadcrumb`, etc. Fornecem a base visual e funcional.
*   **`sidebar.tsx`**: Componente customizado para a barra de navegação lateral, oferecendo links para as seções principais (Baralhos, Revisão).
*   **`use-toast.ts`**: **NOVO:** Hook customizado (baseado na implementação do `shadcn/ui`) para gerenciar e exibir notificações toast.

### 5.2 Componentes de Cartão (`src/components/Card`)

*   **`CardDisplay.tsx`**: Responsável por exibir um único cartão durante a revisão. Mostra a frente, permite revelar o verso e apresenta botões de avaliação ("Errei", "Difícil", "Bom", "Fácil") que acionam a callback `onRate`. Foi modernizado para usar o componente `Card` do `shadcn/ui` com layout aprimorado.

### 5.3 Componentes de Baralho (`src/components/Deck`)

*   **`DeckList.tsx`**: **ALTAMENTE MODIFICADO:** Exibe a lista de baralhos do usuário. Agora implementa uma visualização **hierárquica** (árvore) para suportar baralhos aninhados.
    *   Utiliza um componente recursivo interno `DeckNode`.
    *   Mostra indentação e ícones (`Folder`, `FileText`) para indicar a estrutura.
    *   Permite expandir/recolher baralhos pais (`ChevronDown`, `ChevronRight`).
    *   Inclui botões para "Abrir" (ver detalhes), "Revisar" e "Excluir" (com diálogo de confirmação) para cada baralho.
    *   Aceita um `addDeckTrigger` como prop para exibir o botão/link que abre o diálogo de adição (definido na `HomePage`).
    *   Usa `Skeleton` para indicar o estado de carregamento.
*   **`DeckDetail.tsx`**: **MODIFICADO:** Exibe os detalhes de um baralho específico, incluindo a lista de cartões associados e um formulário para adicionar novos cartões.
    *   **NOVO:** Exibe uma navegação por **breadcrumbs** no topo, mostrando o caminho hierárquico completo até o baralho atual (ex: Home / Baralho Pai / Baralho Atual).
    *   Lista os cartões existentes no baralho, com opções para excluir cada cartão (usando `AlertDialog` para confirmação).
    *   Permite adicionar novos cartões através de um formulário expansível.
    *   Usa `Skeleton` para indicar o estado de carregamento.

### 5.4 Componentes de Revisão (`src/components/Review`)

*   **`ReviewInterface.tsx`**: Orquestra a sessão de revisão.
    *   Busca os cartões devidos (usando `useReview`, que internamente usa `supabase`).
    *   Renderiza o `CardDisplay` para o cartão atual.
    *   Gerencia o estado da sessão (cartão atual, fim da sessão).
    *   **MODIFICADO:** Exibe uma barra de progresso (`Progress`) indicando o avanço na sessão.
    *   Mostra uma tela de conclusão ao final da sessão.
    *   Usa `Skeleton` para indicar o estado de carregamento inicial.

