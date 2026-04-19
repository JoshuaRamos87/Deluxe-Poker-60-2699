export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A

export interface Card {
  suit: Suit;
  rank: Rank;
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

export const PAYTABLE: Record<HandRank, number> = {
  [HandRank.ROYAL_FLUSH]: 5000,
  [HandRank.STRAIGHT_FLUSH]: 250,
  [HandRank.FOUR_OF_A_KIND]: 125,
  [HandRank.FULL_HOUSE]: 40,
  [HandRank.FLUSH]: 25,
  [HandRank.STRAIGHT]: 20,
  [HandRank.THREE_OF_A_KIND]: 15,
  [HandRank.TWO_PAIR]: 10,
  [HandRank.PAIR]: 5,
  [HandRank.HIGH_CARD]: 0,
};

export type GamePhase = 'idle' | 'dealt' | 'gameover';

export interface GameSession {
  sessionId: string;
  currentPlayer: 1 | 2;
  p1Score: number;
  p2Score: number;
  deck: Card[];
  currentHand: Card[];
  heldIndices: boolean[];
  phase: GamePhase;
}
