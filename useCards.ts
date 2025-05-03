import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CardData } from '@/types'; // Assuming a types file

export const useCards = (deckId: string | undefined) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!deckId) {
      setCards([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }
      // Fetch cards for the specific deck
      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCards(data || []);
    } catch (err: any) {
      console.error(`Error fetching cards for deck ${deckId}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchCards();
    // Optional: Add real-time subscription for cards in this deck
  }, [fetchCards]);

  const addCard = async (front_content: string, back_content: string): Promise<CardData | null> => {
     if (!deckId) {
        setError(new Error('Deck ID não fornecido para adicionar cartão.'));
        return null;
     }
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }
      const user = sessionData.session.user;

      const { data, error } = await supabase
        .from('cards')
        .insert([{ deck_id: deckId, user_id: user.id, front_content, back_content }])
        .select()
        .single();

      if (error) throw error;

      setCards(prevCards => [data, ...prevCards]); // Add to list
      return data;
    } catch (err: any) {
      console.error('Error adding card:', err);
      setError(err);
      return null;
    }
  };

  const updateCard = async (cardId: string, updates: Partial<CardData>): Promise<CardData | null> => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;

      setCards(prevCards => prevCards.map(card => card.id === cardId ? data : card));
      return data;
    } catch (err: any) {
      console.error(`Error updating card ${cardId}:`, err);
      setError(err);
      return null;
    }
  };

  const deleteCard = async (cardId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      setCards(prevCards => prevCards.filter(card => card.id !== cardId));
      return true;
    } catch (err: any) {
      console.error(`Error deleting card ${cardId}:`, err);
      setError(err);
      return false;
    }
  };


  return { cards, isLoading, error, fetchCards, addCard, updateCard, deleteCard };
};

