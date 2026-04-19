import { Card, Rank, Suit, HandRank, PAYTABLE } from './types.js';

export function createDeck(): Card[] {
  const suits: Suit[] = ['S', 'H', 'D', 'C'];
  const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function evaluateHand(hand: Card[]): { rank: HandRank; points: number; winningIndices: number[] } {
  if (hand.length !== 5) {
    return { rank: HandRank.HIGH_CARD, points: 0, winningIndices: [] };
  }

  const sortedRanks = [...hand].map(c => c.rank).sort((a, b) => a - b);
  const suits = hand.map(c => c.suit);
  const rankCounts: Record<number, number[]> = {}; // rank -> indices
  hand.forEach((c, i) => {
    if (!rankCounts[c.rank]) rankCounts[c.rank] = [];
    rankCounts[c.rank].push(i);
  });

  const isFlush = new Set(suits).size === 1;
  const flushIndices = [0, 1, 2, 3, 4];
  
  // Check for Straight
  let isStraight = false;
  let straightIndices: number[] = [0, 1, 2, 3, 4];
  
  // Standard straight
  if (new Set(sortedRanks).size === 5 && sortedRanks[4] - sortedRanks[0] === 4) {
    isStraight = true;
  }
  // Low Ace straight (A, 2, 3, 4, 5)
  if (!isStraight && JSON.stringify(sortedRanks) === JSON.stringify([2, 3, 4, 5, 14])) {
    isStraight = true;
  }

  const counts = Object.entries(rankCounts)
    .map(([rank, indices]) => ({ rank: Number(rank), indices }))
    .sort((a, b) => b.indices.length - a.indices.length);

  if (isStraight && isFlush) {
    if (sortedRanks[0] === 10 && sortedRanks[4] === 14) {
      return { rank: HandRank.ROYAL_FLUSH, points: PAYTABLE[HandRank.ROYAL_FLUSH], winningIndices: [0, 1, 2, 3, 4] };
    }
    return { rank: HandRank.STRAIGHT_FLUSH, points: PAYTABLE[HandRank.STRAIGHT_FLUSH], winningIndices: [0, 1, 2, 3, 4] };
  }

  if (counts[0].indices.length === 4) {
    return { rank: HandRank.FOUR_OF_A_KIND, points: PAYTABLE[HandRank.FOUR_OF_A_KIND], winningIndices: counts[0].indices };
  }

  if (counts[0].indices.length === 3 && counts[1].indices.length === 2) {
    return { rank: HandRank.FULL_HOUSE, points: PAYTABLE[HandRank.FULL_HOUSE], winningIndices: [0, 1, 2, 3, 4] };
  }

  if (isFlush) {
    return { rank: HandRank.FLUSH, points: PAYTABLE[HandRank.FLUSH], winningIndices: flushIndices };
  }

  if (isStraight) {
    return { rank: HandRank.STRAIGHT, points: PAYTABLE[HandRank.STRAIGHT], winningIndices: straightIndices };
  }

  if (counts[0].indices.length === 3) {
    return { rank: HandRank.THREE_OF_A_KIND, points: PAYTABLE[HandRank.THREE_OF_A_KIND], winningIndices: counts[0].indices };
  }

  if (counts[0].indices.length === 2 && counts[1].indices.length === 2) {
    return { rank: HandRank.TWO_PAIR, points: PAYTABLE[HandRank.TWO_PAIR], winningIndices: [...counts[0].indices, ...counts[1].indices] };
  }

  if (counts[0].indices.length === 2) {
    // Jacks or Better check
    if (counts[0].rank >= 11) {
      return { rank: HandRank.PAIR, points: PAYTABLE[HandRank.PAIR], winningIndices: counts[0].indices };
    }
  }

  return { rank: HandRank.HIGH_CARD, points: PAYTABLE[HandRank.HIGH_CARD], winningIndices: [] };
}
