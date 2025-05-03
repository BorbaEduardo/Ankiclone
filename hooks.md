## 6. Hooks React Customizados (`src/hooks`)

Os hooks customizados encapsulam a lógica de busca de dados, manipulação de estado e interações com o Supabase.

*   **`useDecks.ts`**: **MODIFICADO**
    *   Responsável por buscar e gerenciar os baralhos do usuário.
    *   `fetchDecks`: Busca **todos** os baralhos do usuário logado do Supabase, incluindo o campo `parent_deck_id`.
    *   `addDeck`: **Atualizado** para aceitar um `parentDeckId` opcional ao criar um novo baralho. Insere o novo baralho no Supabase com a referência correta ao pai.
    *   `deleteDeck`: Exclui um baralho do Supabase. A exclusão em cascata definida no banco de dados (`ON DELETE CASCADE`) garante que os sub-baralhos e cartões associados também sejam removidos. Após a exclusão, chama `fetchDecks` para atualizar a lista.
    *   Mantém o estado `decks` como uma lista plana; a construção da hierarquia é feita no componente `DeckList`.
*   **`useCards.ts`**:
    *   Responsável por buscar e gerenciar os cartões de um baralho específico (`deckId`).
    *   `fetchCards`: Busca os cartões associados ao `deckId` fornecido.
    *   `addCard`: Adiciona um novo cartão ao baralho atual.
    *   `deleteCard`: Exclui um cartão específico.
    *   *Nota*: A lógica deste hook não precisou ser alterada significativamente para suportar baralhos aninhados, pois ele opera no contexto de um `deckId` específico.
*   **`useReview.ts`**: (Implementação conceitual, pode estar integrada em `ReviewInterface.tsx`)
    *   Gerencia a lógica da sessão de revisão.
    *   Busca os cartões devidos para revisão (geral ou de um baralho específico) com base na `due_date` na tabela `reviews`.
    *   Interage com a função `updateReviewData` do `srs.ts` para calcular o próximo agendamento após a avaliação do usuário.
    *   Atualiza o registro correspondente na tabela `reviews` no Supabase.
    *   *Nota*: A lógica de revisão em si não é diretamente afetada pela estrutura de baralhos aninhados, mas a *seleção* de quais cartões revisar pode ser influenciada (ex: revisar um baralho pai pode incluir cartões de sub-baralhos, embora a implementação atual revise apenas o `deckId` especificado).

