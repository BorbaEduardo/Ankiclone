-- Esquema do Banco de Dados para o Anki Clone App (Supabase/PostgreSQL)
-- Versão 2: Adiciona suporte para baralhos aninhados

-- Tabela de Baralhos (Decks)
CREATE TABLE decks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Referencia a tabela de usuários do Supabase Auth
    parent_deck_id uuid REFERENCES decks(id) ON DELETE CASCADE, -- Referência ao baralho pai (para aninhamento)
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- Adiciona uma restrição para evitar que um baralho seja seu próprio pai
    CONSTRAINT check_not_own_parent CHECK (id <> parent_deck_id)
);

-- Índice na coluna parent_deck_id para otimizar buscas hierárquicas
CREATE INDEX idx_decks_parent_deck_id ON decks(parent_deck_id);
-- Índice na coluna user_id
CREATE INDEX idx_decks_user_id ON decks(user_id);

-- Habilitar Row Level Security (RLS) para decks
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam seus próprios decks
-- (A política existente já cobre isso, pois verifica user_id)
CREATE POLICY "Allow users to read their own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem decks para si mesmos
-- Adiciona verificação para garantir que o baralho pai (se existir) também pertença ao usuário
CREATE POLICY "Allow users to insert their own decks" ON decks
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (parent_deck_id IS NULL OR EXISTS (SELECT 1 FROM decks d WHERE d.id = decks.parent_deck_id AND d.user_id = auth.uid()))
    );

-- Política para permitir que usuários atualizem seus próprios decks
-- Adiciona verificação para garantir que o novo baralho pai (se alterado) também pertença ao usuário
CREATE POLICY "Allow users to update their own decks" ON decks
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (
        auth.uid() = user_id AND
        (parent_deck_id IS NULL OR EXISTS (SELECT 1 FROM decks d WHERE d.id = decks.parent_deck_id AND d.user_id = auth.uid()))
    );

-- Política para permitir que usuários deletem seus próprios decks
-- (A política existente já cobre isso, pois verifica user_id. A exclusão em cascata cuidará dos filhos)
CREATE POLICY "Allow users to delete their own decks" ON decks
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela de Cartões (Cards)
CREATE TABLE cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id uuid REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Adicionado para RLS mais fácil e consistência
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índice na coluna deck_id para otimizar buscas por baralho
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
-- Índice na coluna user_id
CREATE INDEX idx_cards_user_id ON cards(user_id);

-- Habilitar RLS para cards
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam seus próprios cards
CREATE POLICY "Allow users to read their own cards" ON cards
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem cards para seus próprios decks
CREATE POLICY "Allow users to insert cards into their own decks" ON cards
    FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()));

-- Política para permitir que usuários atualizem seus próprios cards
CREATE POLICY "Allow users to update their own cards" ON cards
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios cards
CREATE POLICY "Allow users to delete their own cards" ON cards
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela de Revisões (Reviews)
CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    interval INTEGER DEFAULT 0 NOT NULL,
    ease_factor NUMERIC DEFAULT 2.5 NOT NULL,
    repetitions INTEGER DEFAULT 0 NOT NULL,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (card_id, user_id)
);

-- Índices para otimizar buscas comuns
CREATE INDEX idx_reviews_user_due_date ON reviews(user_id, due_date);
CREATE INDEX idx_reviews_card_id ON reviews(card_id);

-- Habilitar RLS para reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam seus próprios dados de revisão
CREATE POLICY "Allow users to read their own review data" ON reviews
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem dados de revisão para seus próprios cartões
CREATE POLICY "Allow users to insert review data for their own cards" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM cards WHERE cards.id = reviews.card_id AND cards.user_id = auth.uid()));

-- Política para permitir que usuários atualizem seus próprios dados de revisão
CREATE POLICY "Allow users to update their own review data" ON reviews
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios dados de revisão
CREATE POLICY "Allow users to delete their own review data" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Função auxiliar para criar uma nova revisão quando um cartão é criado
CREATE OR REPLACE FUNCTION public.handle_new_card_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.reviews (card_id, user_id, due_date)
  VALUES (new.id, new.user_id, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função após a inserção de um novo cartão
-- (Verificar se o trigger já existe antes de criar)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_card_created') THEN
    CREATE TRIGGER on_card_created
      AFTER INSERT ON public.cards
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_card_review();
  END IF;
END
$$;

-- NOTA: Aplicar este schema atualizado pode exigir cuidado se dados já existirem.
-- Pode ser necessário primeiro adicionar a coluna `parent_deck_id` com ALTER TABLE,
-- depois adicionar a constraint e atualizar as políticas.
-- Exemplo de como adicionar a coluna separadamente:
-- ALTER TABLE decks ADD COLUMN parent_deck_id uuid REFERENCES decks(id) ON DELETE CASCADE;
-- ALTER TABLE decks ADD CONSTRAINT check_not_own_parent CHECK (id <> parent_deck_id);
-- (Recriar/Atualizar políticas de INSERT e UPDATE para decks depois)

