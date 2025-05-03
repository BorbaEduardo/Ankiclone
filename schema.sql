-- Esquema do Banco de Dados para o Anki Clone App (Supabase/PostgreSQL)

-- Tabela de Baralhos (Decks)
CREATE TABLE decks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Referencia a tabela de usuários do Supabase Auth
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security (RLS) para decks
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários leiam seus próprios decks
CREATE POLICY "Allow users to read their own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem decks para si mesmos
CREATE POLICY "Allow users to insert their own decks" ON decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios decks
CREATE POLICY "Allow users to update their own decks" ON decks
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios decks
CREATE POLICY "Allow users to delete their own decks" ON decks
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela de Cartões (Cards)
CREATE TABLE cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id uuid REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Adicionado para RLS mais fácil
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

-- Política para permitir que usuários leiam seus próprios cards (verificando o dono do deck)
CREATE POLICY "Allow users to read their own cards" ON cards
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários criem cards para seus próprios decks
-- Adiciona uma verificação para garantir que o user_id do card corresponda ao auth.uid()
CREATE POLICY "Allow users to insert cards into their own decks" ON cards
    FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()));

-- Política para permitir que usuários atualizem seus próprios cards
CREATE POLICY "Allow users to update their own cards" ON cards
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios cards
CREATE POLICY "Allow users to delete their own cards" ON cards
    FOR DELETE USING (auth.uid() = user_id);

-- Tabela de Revisões (Reviews) - Armazena o estado SRS para cada cartão por usuário
CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id uuid REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    due_date TIMESTAMPTZ NOT NULL, -- Data/hora da próxima revisão
    interval INTEGER DEFAULT 0 NOT NULL, -- Intervalo em dias
    ease_factor NUMERIC DEFAULT 2.5 NOT NULL, -- Fator de facilidade (EF)
    repetitions INTEGER DEFAULT 0 NOT NULL, -- Número de repetições corretas consecutivas
    last_reviewed_at TIMESTAMPTZ, -- Data/hora da última revisão
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (card_id, user_id) -- Garante que só existe um registro de revisão por cartão/usuário
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
-- Adiciona uma verificação para garantir que o user_id da revisão corresponda ao auth.uid()
CREATE POLICY "Allow users to insert review data for their own cards" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM cards WHERE cards.id = reviews.card_id AND cards.user_id = auth.uid()));

-- Política para permitir que usuários atualizem seus próprios dados de revisão
CREATE POLICY "Allow users to update their own review data" ON reviews
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios dados de revisão (menos comum, mas possível)
CREATE POLICY "Allow users to delete their own review data" ON reviews
    FOR DELETE USING (auth.uid() = user_id);


-- Função auxiliar para criar uma nova revisão quando um cartão é criado
CREATE OR REPLACE FUNCTION public.handle_new_card_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.reviews (card_id, user_id, due_date)
  VALUES (new.id, new.user_id, now()); -- Define a data de vencimento inicial como agora
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função após a inserção de um novo cartão
CREATE TRIGGER on_card_created
  AFTER INSERT ON public.cards
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_card_review();


-- Adicionar user_id à tabela cards se ainda não existir (para RLS)
-- Esta parte é condicional, caso a tabela já exista sem user_id
-- ALTER TABLE cards ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
-- UPDATE cards SET user_id = (SELECT user_id FROM decks WHERE decks.id = cards.deck_id) WHERE user_id IS NULL;
-- ALTER TABLE cards ALTER COLUMN user_id SET NOT NULL; -- Opcional, dependendo da estratégia

