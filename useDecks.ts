import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Deck } from '@/types'; // Import updated Deck type

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]); // Still stores a flat list
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDecks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }
      const user = sessionData.session.user;

      // Fetch all decks belonging to the current user
      const { data, error: fetchError } = await supabase
        .from('decks')
        .select('*') // Includes parent_deck_id now
        .eq('user_id', user.id)
        .order('name', { ascending: true }); // Order alphabetically for easier processing later

      if (fetchError) throw fetchError;

      setDecks(data || []);
    } catch (err: any) {
      console.error('Error fetching decks:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
    // TODO: Consider real-time updates for deck changes
  }, [fetchDecks]);

  // Updated function to add a deck, accepting optional parent_deck_id
  const addDeck = async (name: string, description?: string, parentDeckId?: string | null): Promise<Deck | null> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }
      const user = sessionData.session.user;

      const { data, error } = await supabase
        .from('decks')
        .insert([{ 
            name, 
            description, 
            user_id: user.id, 
            parent_deck_id: parentDeckId // Include parent_deck_id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add the new deck to the flat list
      // A more sophisticated approach might re-fetch or insert hierarchically
      setDecks(prevDecks => [...prevDecks, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err: any) {
      console.error('Error adding deck:', err);
      setError(err);
      return null;
    }
  };

  // Function to delete a deck (remains the same, cascade delete handles children in DB)
  const deleteDeck = async (deckId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      // Update UI: Remove the deck and potentially its children from the flat list
      // Fetching again might be simpler to handle hierarchy changes
      // setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      fetchDecks(); // Refetch to get the updated list after deletion
      return true;
    } catch (err: any) {
      console.error('Error deleting deck:', err);
      setError(err);
      return false;
    }
  };

  // TODO: Add function for updateDeck if needed (e.g., moving decks)

  return { decks, isLoading, error, fetchDecks, addDeck, deleteDeck };
};

