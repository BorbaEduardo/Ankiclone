import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCards } from '@/hooks/useCards';
import { useDecks } from '@/hooks/useDecks'; // Import useDecks to get all decks for breadcrumbs
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card as ShadCard, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'; // Import Breadcrumb components
import { Trash2, PlusCircle, ArrowLeft, Home } from 'lucide-react';
import { Deck } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getBreadcrumbPath } from '@/lib/deckUtils'; // Import breadcrumb utility

const DeckDetail: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { cards, isLoading: isLoadingCards, error: cardsError, addCard, deleteCard } = useCards(deckId);
  const { decks: allDecks, isLoading: isLoadingAllDecks } = useDecks(); // Fetch all decks for breadcrumbs
  const { toast } = useToast();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoadingDeck, setIsLoadingDeck] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);

  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const [isDeletingCard, setIsDeletingCard] = useState<string | null>(null);

  // Fetch current deck details effect
  useEffect(() => {
    const fetchDeckDetails = async () => {
      if (!deckId) return;
      setIsLoadingDeck(true);
      setDeckError(null);
      try {
        const { data, error } = await supabase
          .from('decks')
          .select('*') // Includes parent_deck_id
          .eq('id', deckId)
          .single();
        if (error) throw error;
        setDeck(data);
      } catch (err: any) {
        console.error('Error fetching deck details:', err);
        setDeckError(err.message || 'Erro ao buscar detalhes do baralho.');
      } finally {
        setIsLoadingDeck(false);
      }
    };
    fetchDeckDetails();
  }, [deckId]);

  // Calculate breadcrumbs
  const breadcrumbPath = useMemo(() => {
    if (isLoadingAllDecks || !deck) return [];
    return getBreadcrumbPath(deck.id, allDecks);
  }, [deck, allDecks, isLoadingAllDecks]);

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId || !newFront || !newBack || isAddingCard) return;
    setIsAddingCard(true);
    const added = await addCard(newFront, newBack);
    setIsAddingCard(false);
    if (added) {
      setNewFront('');
      setNewBack('');
      setShowAddCardForm(false);
      toast({ title: "Sucesso!", description: "Cartão adicionado ao baralho." });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao adicionar o cartão." });
    }
  };

  const handleDeleteCardClick = async (cardId: string) => {
    setIsDeletingCard(cardId);
    const success = await deleteCard(cardId);
    setIsDeletingCard(null);
    if (success) {
      toast({ title: "Sucesso!", description: "Cartão excluído." });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir o cartão." });
    }
  };

  // Combined loading state
  if (isLoadingDeck || isLoadingAllDecks) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-6 w-1/2 mb-4" /> {/* Breadcrumb placeholder */}
        <Skeleton className="h-10 w-1/2" /> {/* Deck title placeholder */}
        <Skeleton className="h-6 w-3/4" /> {/* Deck description placeholder */}
        <Skeleton className="h-10 w-48" /> {/* Add card button placeholder */}
        <Skeleton className="h-8 w-1/3 mt-6" /> {/* Cards title placeholder */}
        <Skeleton className="h-24 w-full" /> {/* Card placeholder */}
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (deckError && !deck) {
    return <div className="container mx-auto p-6 text-red-500">Erro: {deckError}</div>;
  }

  if (!deck) {
    return <div className="container mx-auto p-6">Baralho não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/"><Home className="h-4 w-4" /></Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbPath.map((item, index) => (
            <React.Fragment key={item.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === breadcrumbPath.length - 1 ? (
                  <BreadcrumbPage className="truncate max-w-xs">{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={`/decks/${item.id}`} className="truncate max-w-xs">{item.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Deck Title and Description */}
      <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
      {deck.description && <p className="text-muted-foreground mb-6">{deck.description}</p>}

      {/* Add Card Section */}
      <div className="mb-8">
        <Button onClick={() => setShowAddCardForm(!showAddCardForm)} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          {showAddCardForm ? 'Cancelar' : 'Adicionar Novo Cartão'}
        </Button>
        {showAddCardForm && (
          <ShadCard className="mt-4 border-border">
            <form onSubmit={handleAddCardSubmit}>
              <CardHeader>
                <CardTitle>Novo Cartão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                  <label htmlFor="front" className="block text-sm font-medium text-foreground mb-1">Frente:</label>
                  <Textarea id="front" value={newFront} onChange={(e) => setNewFront(e.target.value)} placeholder="Conteúdo da frente" required className="mt-1 bg-card" />
                </div>
                <div>
                  <label htmlFor="back" className="block text-sm font-medium text-foreground mb-1">Verso:</label>
                  <Textarea id="back" value={newBack} onChange={(e) => setNewBack(e.target.value)} placeholder="Conteúdo do verso" required className="mt-1 bg-card" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isAddingCard}>{isAddingCard ? 'Adicionando...' : 'Adicionar Cartão'}</Button>
              </CardFooter>
            </form>
          </ShadCard>
        )}
      </div>

      {/* Cards List Section */}
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Cartões no Baralho ({cards.length})</h2>
      {isLoadingCards ? (
         <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
         </div>
      ) : cardsError ? (
         <div className="text-destructive">Erro ao carregar cartões: {cardsError.message}</div>
      ) : cards.length === 0 ? (
        <p className="text-muted-foreground">Este baralho ainda não tem cartões.</p>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => (
            <ShadCard key={card.id} className="bg-card border-border">
              <CardContent className="pt-6 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2 break-words">
                  <p><strong className="font-medium text-foreground">Frente:</strong> {card.front_content}</p>
                  <hr className="border-border"/>
                  <p><strong className="font-medium text-foreground">Verso:</strong> {card.back_content}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-4 flex-shrink-0 text-destructive hover:bg-destructive/10" disabled={isDeletingCard === card.id}>
                      {isDeletingCard === card.id ? <div className="h-4 w-4 border-2 border-t-transparent border-destructive rounded-full animate-spin"></div> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente este cartão.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsDeletingCard(null)}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCardClick(card.id)} disabled={isDeletingCard === card.id} className="bg-destructive hover:bg-destructive/90">Excluir Cartão</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </ShadCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckDetail;

