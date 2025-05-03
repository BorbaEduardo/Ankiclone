import React from 'react';
import DeckList from '@/components/Deck/DeckList';
import { Button } from '@/components/ui/button';
import { useDecks } from '@/hooks/useDecks';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { useToast } from '@/components/ui/use-toast';
import { Deck } from '@/types'; // Import Deck type

// Refined structure:
const HomePageRefined: React.FC = () => {
  // Destructure decks from useDecks to populate the parent select
  const { decks, isLoading, error, addDeck, deleteDeck } = useDecks();
  const { toast } = useToast();
  const [newDeckName, setNewDeckName] = React.useState('');
  const [newDeckDesc, setNewDeckDesc] = React.useState('');
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null); // State for selected parent deck
  const [isAdding, setIsAdding] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const handleAddDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName || isAdding) return;
    setIsAdding(true);
    // Pass selectedParentId (or null if 'None' is chosen) to addDeck
    const addedDeck = await addDeck(newDeckName, newDeckDesc || undefined, selectedParentId);
    setIsAdding(false);
    if (addedDeck) {
      setNewDeckName('');
      setNewDeckDesc('');
      setSelectedParentId(null); // Reset parent selection
      toast({ title: "Sucesso!", description: `Baralho "${addedDeck.name}" criado.` });
      setIsAddDialogOpen(false); // Close dialog on success
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao criar o baralho." });
    }
  };

  // Trigger component definition
  const addDeckDialogTrigger = (
    <DialogTrigger asChild>
      <Button>Adicionar Novo Baralho</Button>
    </DialogTrigger>
  );

  // Filter out potential cycles if needed, though DB constraint helps
  const availableParentDecks = decks; // For now, allow any deck as parent

  return (
    <div className="p-6">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        {/* DeckList now includes the trigger passed as a prop */}
        <DeckList
          decks={decks} // Pass the flat list for now
          isLoading={isLoading}
          error={error}
          deleteDeck={deleteDeck}
          addDeckTrigger={addDeckDialogTrigger} // Pass the trigger component
        />

        {/* Dialog Content remains defined here, associated with the Dialog wrapper */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Baralho</DialogTitle>
            <DialogDescription>
              Crie um novo baralho. Você pode aninhá-lo dentro de um baralho existente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDeckSubmit}>
            <div className="grid gap-4 py-4">
              {/* Input fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">Nome</label>
                <Input id="name" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">Descrição</label>
                <Input id="description" value={newDeckDesc} onChange={(e) => setNewDeckDesc(e.target.value)} className="col-span-3" placeholder="(Opcional)" />
              </div>
              {/* Parent Deck Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="parent" className="text-right">Baralho Pai</label>
                <Select
                  value={selectedParentId ?? 'none'} // Use 'none' for null value
                  onValueChange={(value) => setSelectedParentId(value === 'none' ? null : value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um baralho pai (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Nível Superior)</SelectItem>
                    {availableParentDecks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name} {/* Consider showing hierarchy here later */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isAdding}>{isAdding ? 'Adicionando...' : 'Adicionar Baralho'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePageRefined;

