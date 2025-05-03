// Placeholder types based on schema.sql and component usage

export interface Deck {
  id: string;
  user_id: string;
  parent_deck_id?: string | null; // Added for nested decks
  name: string;
  description?: string | null;
  created_at: string;
  // Optional: Add children array if processing hierarchy in hook
  // children?: Deck[]; 
}

export interface CardData {
  id: string;
  deck_id: string;
  user_id: string;
  front_content: string;
  back_content: string;
  created_at: string;
}

export interface ReviewData {
  id: string;
  card_id: string;
  user_id: string;
  due_date: string; // TIMESTAMPTZ
  interval: number; // INTEGER (days)
  ease_factor: number; // NUMERIC
  repetitions: number; // INTEGER
  last_reviewed_at: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
}

// Combined type often used in review interface
export interface CardWithReview extends CardData {
  review: ReviewData;
}

