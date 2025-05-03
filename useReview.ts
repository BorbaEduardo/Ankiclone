import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { updateReviewData } from '@/lib/srs';
import { CardWithReview, ReviewData } from '@/types'; // Assuming types file

export const useReview = (deckId?: string) => {
  const [dueCards, setDueCards] = useState<CardWithReview[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);

  const fetchDueCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);
    setCurrentCardIndex(0);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }
      const user = sessionData.session.user;

      const now = new Date().toISOString();

      // Query reviews table, join with cards table
      let query = supabase
        .from('reviews')
        .select(`
          id,
          card_id,
          user_id,
          due_date,
          interval,
          ease_factor,
          repetitions,
          last_reviewed_at,
          created_at,
          cards!inner (
            id,
            deck_id,
            user_id,
            front_content,
            back_content,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .lte('due_date', now); // Fetch cards due now or earlier

      if (deckId) {
        // If reviewing a specific deck, filter by deck_id on the joined cards table
        query = query.eq('cards.deck_id', deckId);
      }

      // Limit the number of cards per session
      query = query.limit(20); // Example limit
      // Add ordering if needed, e.g., by due_date ascending
      query = query.order('due_date', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process the data which includes both review and card details
      const formattedCards: CardWithReview[] = data?.map((item: any) => ({
        ...(item.cards as any), // Spread card details
        review: {
          id: item.id,
          card_id: item.card_id,
          user_id: item.user_id,
          due_date: item.due_date,
          interval: item.interval,
          ease_factor: item.ease_factor,
          repetitions: item.repetitions,
          last_reviewed_at: item.last_reviewed_at,
          created_at: item.created_at,
        } as ReviewData,
      })) || [];

      setDueCards(formattedCards);

      if (formattedCards.length === 0) {
        setSessionFinished(true);
      }

    } catch (err: any) {
      console.error('Error fetching due cards:', err);
      setError(err.message || 'Falha ao buscar cartões para revisão.');
      setDueCards([]); // Clear cards on error
      setSessionFinished(true); // End session if loading fails
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  const rateCard = async (rating: number) => {
    if (currentCardIndex >= dueCards.length || isLoading) return;

    const currentCard = dueCards[currentCardIndex];
    const currentReview = currentCard.review;
    setIsLoading(true); // Indicate processing

    try {
      // 1. Calculate new review data using SRS logic
      const updatedReviewFields = updateReviewData(currentReview, rating);

      // 2. Update Supabase
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          due_date: updatedReviewFields.due_date,
          interval: updatedReviewFields.interval,
          ease_factor: updatedReviewFields.ease_factor,
          repetitions: updatedReviewFields.repetitions,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', currentReview.id);

      if (updateError) throw updateError;

      // 3. Move to the next card or finish
      const nextIndex = currentCardIndex + 1;
      if (nextIndex < dueCards.length) {
        setCurrentCardIndex(nextIndex);
      } else {
        setSessionFinished(true);
      }
    } catch (err: any) {
      console.error(`Error updating review for card ${currentCard.id}:`, err);
      setError(`Falha ao atualizar o cartão ${currentCard.id}: ${err.message}`);
      // Decide how to handle errors: skip card, retry, etc.
      // For simplicity, we move to the next card even on error
      const nextIndex = currentCardIndex + 1;
      if (nextIndex < dueCards.length) {
        setCurrentCardIndex(nextIndex);
      } else {
        setSessionFinished(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = dueCards.length > 0 && currentCardIndex < dueCards.length ? dueCards[currentCardIndex] : null;

  return {
    currentCard,
    remainingCount: dueCards.length - currentCardIndex,
    totalCount: dueCards.length,
    isLoading,
    error,
    sessionFinished,
    rateCard,
    fetchDueCards, // Expose refetch function
  };
};

