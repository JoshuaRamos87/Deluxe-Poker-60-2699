export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type GamePhase = 'idle' | 'dealt' | 'gameover';

export interface GameSession {
  sessionId: string;
  currentPlayer: 1 | 2;
  p1Score: number;
  p2Score: number;
  currentHand: Card[];
  phase: GamePhase;
}

export enum HandRank {
  HIGH_CARD = 'High Card',
  PAIR = 'One Pair (Jacks or Better)',
  TWO_PAIR = 'Two Pair',
  THREE_OF_A_KIND = 'Three of a Kind',
  STRAIGHT = 'Straight',
  FLUSH = 'Flush',
  FULL_HOUSE = 'Full House',
  FOUR_OF_A_KIND = 'Four of a Kind',
  STRAIGHT_FLUSH = 'Straight Flush',
  ROYAL_FLUSH = 'Royal Flush',
}
