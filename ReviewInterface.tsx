import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import CardDisplay from '@/components/Card/CardDisplay';
import { updateReviewData } from '@/lib/srs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Import Progress
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { CardData, ReviewData, CardWithReview } from '@/types'; // Assuming types are centralized
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const ReviewInterface: React.FC = () => {
  const { deckId } = useParams<{ deckId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dueCards, setDueCards] = useState<CardWithReview[]>([]);
  const [initialCardCount, setInitialCardCount] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionFinished, setSessionFinished] = useState(false);

  const fetchDueCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);
    setCurrentCardIndex(0);
    setInitialCardCount(0);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }
      const user = sessionData.session.user;
      const now = new Date().toISOString();

      let query = supabase
        .from('reviews')
        .select(`
          *,
          cards (*)
        `, { count: 'exact' }) // Request count
        .eq('user_id', user.id)
        .lte('due_date', now);

      if (deckId) {
        query = query.eq('cards.deck_id', deckId);
      }

      query = query.limit(20); // Limit session size

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      const validCards = data?.filter(item => item.cards !== null) as { review: ReviewData; cards: CardData }[] || [];
      const formattedCards: CardWithReview[] = validCards.map(item => ({
        ...item.cards,
        review: item as unknown as ReviewData
      }));

      setDueCards(formattedCards);
      setInitialCardCount(formattedCards.length); // Store initial count for progress

      if (formattedCards.length === 0) {
        setSessionFinished(true);
      }

    } catch (err: any) {
      console.error('Error fetching due cards:', err);
      setError(err.message || 'Falha ao buscar cartões para revisão.');
      toast({ variant: "destructive", title: "Erro", description: err.message || 'Falha ao buscar cartões.' });
    } finally {
      setIsLoading(false);
    }
  }, [deckId, toast]);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  const handleRating = async (rating: number) => {
    if (currentCardIndex >= dueCards.length) return;

    const currentCard = dueCards[currentCardIndex];
    const currentReview = currentCard.review;

    try {
      const updatedReviewData = updateReviewData(currentReview, rating);
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
          due_date: updatedReviewData.due_date,
          interval: updatedReviewData.interval,
          ease_factor: updatedReviewData.ease_factor,
          repetitions: updatedReviewData.repetitions,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', currentReview.id);

      if (updateError) throw updateError;

      if (currentCardIndex + 1 < dueCards.length) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setSessionFinished(true);
      }
    } catch (err: any) {
      console.error('Error updating review:', err);
      setError(`Falha ao atualizar o cartão ${currentCard.id}: ${err.message}`);
      toast({ variant: "destructive", title: "Erro", description: `Falha ao atualizar o cartão: ${err.message}` });
      // Move on even if error occurs for simplicity
      if (currentCardIndex + 1 < dueCards.length) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setSessionFinished(true);
      }
    }
  };

  const progressValue = initialCardCount > 0 ? ((currentCardIndex) / initialCardCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center">
        <Skeleton className="h-8 w-1/4 mb-4" /> {/* Title placeholder */}
        <Skeleton className="h-10 w-full max-w-2xl mb-4" /> {/* Progress bar placeholder */}
        <Skeleton className="w-full max-w-2xl h-[350px]" /> {/* CardDisplay placeholder */}
      </div>
    );
  }

  if (sessionFinished) {
    return (
      <div className="container mx-auto p-6 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <h2 className="text-3xl font-bold mb-4 text-primary">Revisão Concluída!</h2>
        <p className="mb-6 text-muted-foreground">Você revisou todos os {initialCardCount} cartões devidos para esta sessão.</p>
        {error && <p className="text-destructive mb-4">Alguns erros ocorreram durante a sessão.</p>}
        <div className="flex gap-4">
          <Link to={deckId ? `/decks/${deckId}` : '/'}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {deckId ? 'Voltar ao Baralho' : 'Voltar aos Baralhos'}
            </Button>
          </Link>
          <Button onClick={fetchDueCards}>Revisar Mais</Button>
        </div>
      </div>
    );
  }

  if (error && dueCards.length === 0) {
    return <div className="container mx-auto p-6 text-destructive">Erro: {error}</div>;
  }

  if (dueCards.length === 0) {
     // This case should ideally be handled by sessionFinished, but as a fallback:
     return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Nenhum cartão para revisar!</h2>
        <p className="mb-4 text-muted-foreground">Não há cartões devidos para revisão no momento.</p>
        <Link to="/"><Button>Voltar aos Baralhos</Button></Link>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Revisão</h2>
      <Progress value={progressValue} className="w-full max-w-2xl mb-6" />
      {/* Display non-fatal errors if they occur during the session */}
      {error && <p className="text-destructive mb-4">Erro: {error}</p>}
      <CardDisplay card={currentCard} onRate={handleRating} />
      <p className="mt-4 text-sm text-muted-foreground">Cartão {currentCardIndex + 1} de {initialCardCount}</p>
    </div>
  );
};

export default ReviewInterface;

