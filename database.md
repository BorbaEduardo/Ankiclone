## 3. Banco de Dados (Supabase)

O backend e o armazenamento de dados são gerenciados pelo Supabase, uma plataforma Backend-as-a-Service (BaaS) que fornece um banco de dados PostgreSQL, autenticação, APIs instantâneas e funcionalidades em tempo real.

### 3.1 Esquema do Banco de Dados (`schema_v2_nested.sql`)

O esquema define as tabelas e suas relações:

*   **`decks`**: Armazena informações sobre os baralhos.
    *   `id` (uuid, PK): Identificador único do baralho.
    *   `user_id` (uuid, FK -> auth.users): ID do usuário proprietário.
    *   `parent_deck_id` (uuid, FK -> decks): **NOVO:** ID do baralho pai (permite aninhamento). Nulo para baralhos de nível superior.
    *   `name` (text): Nome do baralho.
    *   `description` (text, nullable): Descrição opcional.
    *   `created_at` (timestamptz): Data de criação.
    *   *Constraint*: `check_not_own_parent` garante que `id <> parent_deck_id`.
*   **`cards`**: Armazena o conteúdo dos cartões.
    *   `id` (uuid, PK): Identificador único do cartão.
    *   `deck_id` (uuid, FK -> decks): ID do baralho ao qual o cartão pertence.
    *   `user_id` (uuid, FK -> auth.users): ID do usuário proprietário (para RLS simplificado).
    *   `front_content` (text): Conteúdo da frente do cartão.
    *   `back_content` (text): Conteúdo do verso do cartão.
    *   `created_at` (timestamptz): Data de criação.
*   **`reviews`**: Armazena o estado da Repetição Espaçada (SRS) para cada cartão de cada usuário.
    *   `id` (uuid, PK): Identificador único do registro de revisão.
    *   `card_id` (uuid, FK -> cards): ID do cartão associado.
    *   `user_id` (uuid, FK -> auth.users): ID do usuário associado.
    *   `due_date` (timestamptz): Data/hora da próxima revisão agendada.
    *   `interval` (integer): Intervalo atual em dias até a próxima revisão.
    *   `ease_factor` (numeric): Fator de facilidade (EF) do algoritmo SM-2.
    *   `repetitions` (integer): Número de repetições corretas consecutivas.
    *   `last_reviewed_at` (timestamptz, nullable): Data/hora da última revisão.
    *   `created_at` (timestamptz): Data de criação do registro de revisão.
    *   *Constraint*: `UNIQUE (card_id, user_id)` garante um único registro por cartão/usuário.

### 3.2 Segurança (Row Level Security - RLS)

Políticas de RLS são aplicadas a todas as tabelas para garantir que os usuários só possam acessar e modificar seus próprios dados:

*   **`decks`**: Usuários podem ler, criar, atualizar e excluir seus próprios baralhos. As políticas de inserção e atualização foram **atualizadas** para verificar se o `parent_deck_id` (se fornecido) também pertence ao usuário.
*   **`cards`**: Usuários podem ler, criar, atualizar e excluir cartões pertencentes aos seus próprios baralhos.
*   **`reviews`**: Usuários podem ler, criar, atualizar e excluir seus próprios registros de revisão.

### 3.3 Funções e Triggers

*   **`handle_new_card_review()` (Função PL/pgSQL)**: Chamada automaticamente por um trigger.
*   **`on_card_created` (Trigger)**: Disparado após a inserção de um novo cartão na tabela `cards`. Executa `handle_new_card_review()` para criar um registro inicial na tabela `reviews` para o novo cartão, agendando-o para revisão imediata (`due_date = now()`).

### 3.4 Conexão (`src/lib/supabaseClient.ts`)

Este arquivo inicializa o cliente Supabase usando a URL do projeto e a chave anônima pública, obtidas das variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

```typescript
import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn('Supabase URL not configured. Please add VITE_SUPABASE_URL to your .env file.');
}
if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase Anon Key not configured. Please add VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

