import { describe, it, expect } from 'vitest';
import { evaluateHand } from './logic.js';
import { HandRank, PAYTABLE } from './types.js';

describe('Hand Evaluation', () => {
  it('should identify Royal Flush', () => {
    const hand = [
      { suit: 'S', rank: 10 },
      { suit: 'S', rank: 11 },
      { suit: 'S', rank: 12 },
      { suit: 'S', rank: 13 },
      { suit: 'S', rank: 14 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.ROYAL_FLUSH, points: 5000, winningIndices: [0, 1, 2, 3, 4] });
  });

  it('should identify Straight Flush', () => {
    const hand = [
      { suit: 'H', rank: 5 },
      { suit: 'H', rank: 6 },
      { suit: 'H', rank: 7 },
      { suit: 'H', rank: 8 },
      { suit: 'H', rank: 9 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.STRAIGHT_FLUSH, points: 250, winningIndices: [0, 1, 2, 3, 4] });
  });

  it('should identify Four of a Kind', () => {
    const hand = [
      { suit: 'S', rank: 7 },
      { suit: 'H', rank: 7 },
      { suit: 'D', rank: 7 },
      { suit: 'C', rank: 7 },
      { suit: 'S', rank: 2 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.FOUR_OF_A_KIND, points: 125, winningIndices: [0, 1, 2, 3] });
  });

  it('should identify Full House', () => {
    const hand = [
      { suit: 'S', rank: 10 },
      { suit: 'H', rank: 10 },
      { suit: 'D', rank: 10 },
      { suit: 'C', rank: 4 },
      { suit: 'S', rank: 4 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.FULL_HOUSE, points: 40, winningIndices: [0, 1, 2, 3, 4] });
  });

  it('should identify Flush', () => {
    const hand = [
      { suit: 'D', rank: 2 },
      { suit: 'D', rank: 5 },
      { suit: 'D', rank: 8 },
      { suit: 'D', rank: 10 },
      { suit: 'D', rank: 13 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.FLUSH, points: 25, winningIndices: [0, 1, 2, 3, 4] });
  });

  it('should identify Straight', () => {
    const hand = [
      { suit: 'S', rank: 3 },
      { suit: 'H', rank: 4 },
      { suit: 'D', rank: 5 },
      { suit: 'C', rank: 6 },
      { suit: 'S', rank: 7 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.STRAIGHT, points: 20, winningIndices: [0, 1, 2, 3, 4] });
  });

  it('should identify Low Ace Straight', () => {
    const hand = [
      { suit: 'S', rank: 14 },
      { suit: 'H', rank: 2 },
      { suit: 'D', rank: 3 },
      { suit: 'C', rank: 4 },
      { suit: 'S', rank: 5 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.STRAIGHT, points: 20, winningIndices: [0, 1, 2, 3, 4] });
  });

  it('should identify Three of a Kind', () => {
    const hand = [
      { suit: 'S', rank: 9 },
      { suit: 'H', rank: 9 },
      { suit: 'D', rank: 9 },
      { suit: 'C', rank: 2 },
      { suit: 'S', rank: 3 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.THREE_OF_A_KIND, points: 15, winningIndices: [0, 1, 2] });
  });

  it('should identify Two Pair with low ranks', () => {
    const hand = [
      { suit: 'S', rank: 6 },
      { suit: 'H', rank: 6 },
      { suit: 'D', rank: 4 },
      { suit: 'C', rank: 4 },
      { suit: 'S', rank: 2 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.TWO_PAIR, points: 10, winningIndices: [2, 3, 0, 1] });
  });

  it('should identify Two Pair with mixed ranks', () => {
    const hand = [
      { suit: 'S', rank: 14 },
      { suit: 'H', rank: 14 },
      { suit: 'D', rank: 2 },
      { suit: 'C', rank: 2 },
      { suit: 'S', rank: 5 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.TWO_PAIR, points: 10, winningIndices: [2, 3, 0, 1] });
  });

  it('should identify Jacks or Better Pair (Jacks)', () => {
    const hand = [
      { suit: 'S', rank: 11 },
      { suit: 'H', rank: 11 },
      { suit: 'D', rank: 4 },
      { suit: 'C', rank: 6 },
      { suit: 'S', rank: 2 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.PAIR, points: 5, winningIndices: [0, 1] });
  });

  it('should identify Jacks or Better Pair (Aces)', () => {
    const hand = [
      { suit: 'S', rank: 14 },
      { suit: 'H', rank: 14 },
      { suit: 'D', rank: 4 },
      { suit: 'C', rank: 6 },
      { suit: 'S', rank: 2 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.PAIR, points: 5, winningIndices: [0, 1] });
  });

  it('should not award points for Low Pair (Tens)', () => {
    const hand = [
      { suit: 'S', rank: 10 },
      { suit: 'H', rank: 10 },
      { suit: 'D', rank: 4 },
      { suit: 'C', rank: 6 },
      { suit: 'S', rank: 2 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.HIGH_CARD, points: 0, winningIndices: [] });
  });

  it('should identify High Card as 0 points', () => {
    const hand = [
      { suit: 'S', rank: 14 },
      { suit: 'H', rank: 13 },
      { suit: 'D', rank: 4 },
      { suit: 'C', rank: 6 },
      { suit: 'S', rank: 2 },
    ] as any;
    expect(evaluateHand(hand)).toEqual({ rank: HandRank.HIGH_CARD, points: 0, winningIndices: [] });
  });
});
