import { Deck } from "@/types";

export interface BreadcrumbItem {
  id: string;
  name: string;
}

// Function to get the breadcrumb path for a given deck ID
export const getBreadcrumbPath = (deckId: string | null | undefined, allDecks: Deck[]): BreadcrumbItem[] => {
  if (!deckId) return [];

  const path: BreadcrumbItem[] = [];
  const deckMap = new Map(allDecks.map(deck => [deck.id, deck]));

  let currentDeck = deckMap.get(deckId);

  while (currentDeck) {
    path.unshift({ id: currentDeck.id, name: currentDeck.name });
    if (currentDeck.parent_deck_id) {
      currentDeck = deckMap.get(currentDeck.parent_deck_id);
    } else {
      currentDeck = undefined; // Reached the root
    }
  }

  return path;
};

