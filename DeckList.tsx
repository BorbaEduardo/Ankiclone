import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Deck } from '@/types';
import { Trash2, PlusCircle, ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react'; // Added icons for hierarchy
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { cn } from '@/lib/utils';

// Define a type for the hierarchical deck structure
interface HierarchicalDeck extends Deck {
  children: HierarchicalDeck[];
  level: number; // Add level for indentation
}

interface DeckListProps {
  decks: Deck[]; // Still receives the flat list
  isLoading: boolean;
  error: Error | null;
  addDeckTrigger?: React.ReactNode;
  deleteDeck: (deckId: string) => Promise<boolean>;
}

// Helper function to build the deck hierarchy
const buildDeckTree = (decks: Deck[]): HierarchicalDeck[] => {
  const deckMap: { [id: string]: HierarchicalDeck } = {};
  const rootDecks: HierarchicalDeck[] = [];

  // Initialize map and add level property
  decks.forEach(deck => {
    deckMap[deck.id] = { ...deck, children: [], level: 0 };
  });

  // Build the tree structure
  decks.forEach(deck => {
    const hierarchicalDeck = deckMap[deck.id];
    if (deck.parent_deck_id && deckMap[deck.parent_deck_id]) {
      const parent = deckMap[deck.parent_deck_id];
      parent.children.push(hierarchicalDeck);
      // Sort children alphabetically
      parent.children.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      rootDecks.push(hierarchicalDeck);
    }
  });

  // Function to set levels recursively
  const setLevels = (deckNodes: HierarchicalDeck[], level: number) => {
    deckNodes.forEach(node => {
      node.level = level;
      if (node.children.length > 0) {
        setLevels(node.children, level + 1);
      }
    });
  };

  // Set levels starting from root
  setLevels(rootDecks, 0);

  // Sort root decks alphabetically
  rootDecks.sort((a, b) => a.name.localeCompare(b.name));

  return rootDecks;
};

// Recursive component to render a deck node and its children
const DeckNode: React.FC<{ 
  deck: HierarchicalDeck; 
  deleteDeck: (deckId: string, deckName: string) => Promise<void>; 
  isDeleting: string | null;
  allDecks: Deck[]; // Pass all decks for context if needed
}> = ({ deck, deleteDeck, isDeleting, allDecks }) => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const hasChildren = deck.children.length > 0;

  return (
    <div style={{ paddingLeft: `${deck.level * 1.5}rem` }} className="mb-1">
      <Card className={cn("hover:shadow-md transition-shadow duration-150 border-border", deck.level > 0 ? "bg-muted/30" : "bg-card")}>
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren && (
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="mr-1 h-7 w-7">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            {!hasChildren && (
                <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" style={{ marginLeft: hasChildren ? '0' : 'calc(1.75rem + 4px)' }}/> // Adjust margin if no children
            )}
             {hasChildren && (
                <Folder className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate font-medium">{deck.name}</CardTitle>
              {deck.description && (
                <CardDescription className="text-xs truncate mt-0.5">{deck.description}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Link to={`/decks/${deck.id}`}>
              <Button variant="outline" size="xs">Abrir</Button>
            </Link>
            <Link to={`/review/${deck.id}`}>
              <Button size="xs">Revisar</Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-7 w-7" disabled={isDeleting === deck.id}>
                  {isDeleting === deck.id ? <div className="h-4 w-4 border-2 border-t-transparent border-destructive rounded-full animate-spin"></div> : <Trash2 className="h-4 w-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o baralho "{deck.name}" e TODOS os seus sub-baralhos e cartões.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteDeck(deck.id, deck.name)}
                    disabled={isDeleting === deck.id}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Excluir Baralho
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
      </Card>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {deck.children.map(child => (
            <DeckNode key={child.id} deck={child} deleteDeck={deleteDeck} isDeleting={isDeleting} allDecks={allDecks} />
          ))}
        </div>
      )}
    </div>
  );
};

const DeckList: React.FC<DeckListProps> = ({ decks, isLoading, error, addDeckTrigger, deleteDeck }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Memoize the tree structure to avoid recalculating on every render
  const deckTree = useMemo(() => buildDeckTree(decks), [decks]);

  const handleDeleteClick = async (deckId: string, deckName: string) => {
    setIsDeleting(deckId);
    const success = await deleteDeck(deckId);
    setIsDeleting(null);

    if (success) {
      toast({ title: "Sucesso!", description: `Baralho "${deckName}" e seus sub-baralhos foram excluídos.` });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir o baralho." });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-destructive">Erro ao carregar baralhos: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Baralhos</h1>
        {addDeckTrigger}
      </div>

      {deckTree.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">Você ainda não tem nenhum baralho.</p>
          {addDeckTrigger}
        </div>
      ) : (
        <div>
          {deckTree.map(deck => (
            <DeckNode key={deck.id} deck={deck} deleteDeck={handleDeleteClick} isDeleting={isDeleting} allDecks={decks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckList;

