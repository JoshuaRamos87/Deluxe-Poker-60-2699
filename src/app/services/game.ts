import { Injectable, signal, inject } from '@angular/core';
import { GameSession, Card, GamePhase, HandRank } from '../models/game.models';
import { SoundService } from './sound';
import { createDeck, shuffle, evaluateHand } from '../utils/poker-logic';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private sound = inject(SoundService);
  
  // Signals
  session = signal<GameSession | null>(null);
  heldIndices = signal<boolean[]>([false, false, false, false, false]);
  visibleIndices = signal<boolean[]>([true, true, true, true, true]);
  winningIndices = signal<number[]>([]);
  isFlashing = signal<boolean>(false);
  displayScore = signal<number>(100);
  isAnimating = signal<boolean>(false);
  soundEnabled = signal<boolean>(true);
  lastWin = signal<{ rank: HandRank, points: number } | null>(null);

  async newGame() {
    this.playBeep();
    const session: GameSession = {
      sessionId: Math.random().toString(36).substring(7),
      currentPlayer: 1,
      p1Score: 100,
      p2Score: 100,
      deck: [],
      currentHand: [],
      phase: 'idle',
    };
    this.session.set(session);
    this.displayScore.set(100);
    this.heldIndices.set([false, false, false, false, false]);
    this.visibleIndices.set([true, true, true, true, true]);
    this.lastWin.set(null);
  }

  async deal() {
    if (this.isAnimating()) return;
    this.playBeep(1200);
    const s = this.session();
    if (!s) return;

    // Take Ante
    let p1Score = s.p1Score;
    let p2Score = s.p2Score;
    if (s.currentPlayer === 1) {
      p1Score = Math.max(0, p1Score - 5);
    } else {
      p2Score = Math.max(0, p2Score - 5);
    }
    this.displayScore.set(s.currentPlayer === 1 ? p1Score : p2Score);

    const deck = shuffle(createDeck());
    const hand = deck.splice(0, 5);
    
    // Hide all cards initially
    this.visibleIndices.set([false, false, false, false, false]);
    this.winningIndices.set([]);
    this.isFlashing.set(false);
    
    this.session.update(current => current ? { 
      ...current, 
      deck, 
      currentHand: hand, 
      p1Score,
      p2Score,
      phase: 'dealt' 
    } : null);
    
    this.heldIndices.set([false, false, false, false, false]);
    this.lastWin.set(null);

    this.isAnimating.set(true);
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.visibleIndices.update(v => {
        const next = [...v];
        next[i] = true;
        return next;
      });
      this.playBeep(880);
    }
    this.isAnimating.set(false);
  }

  async draw() {
    if (this.isAnimating()) return;
    this.playBeep(1200);
    const s = this.session();
    if (!s || s.phase !== 'dealt') return;

    this.isAnimating.set(true);

    const newHand = [...s.currentHand];
    const newDeck = [...s.deck];
    for (let i = 0; i < 5; i++) {
      if (!this.heldIndices()[i]) {
        newHand[i] = newDeck.pop()!;
      }
    }

    const { rank, points, winningIndices } = evaluateHand(newHand);
    
    let p1Score = s.p1Score;
    let p2Score = s.p2Score;

    if (s.currentPlayer === 1) {
      p1Score = p1Score + points;
    } else {
      p2Score = p2Score + points;
    }

    const targetScore = s.currentPlayer === 1 ? p1Score : p2Score;

    // Update session state (except displayScore)
    this.session.update(current => current ? { 
      ...current, 
      deck: newDeck,
      currentHand: newHand, 
      p1Score, 
      p2Score, 
      phase: 'gameover' 
    } : null);

    // Visuals: Hide non-held cards
    const currentVisible = [...this.heldIndices()];
    this.visibleIndices.set(currentVisible);

    // Sequential reveal for unheld cards
    for (let i = 0; i < 5; i++) {
      if (!this.heldIndices()[i]) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.visibleIndices.update(v => {
          const next = [...v];
          next[i] = true;
          return next;
        });
        this.playBeep(880);
      }
    }

    this.lastWin.set({ rank, points });
    this.winningIndices.set(winningIndices);
    
    if (points > 0) {
      await this.playWinAnimation();
    }

    await this.animateScoreCount(targetScore);
    this.isAnimating.set(false);
  }

  async animateScoreCount(target: number) {
    const current = this.displayScore();
    if (target <= current) {
      this.displayScore.set(target);
      return;
    }
    while (this.displayScore() < target) {
      this.displayScore.set(this.displayScore() + 1);
      if (this.soundEnabled()) this.sound.playCountingBeep();
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  }

  async playWinAnimation() {
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let note = 0; note < 3; note++) {
        this.isFlashing.set(true);
        if (this.soundEnabled()) this.sound.playWinNote(note);
        await new Promise(resolve => setTimeout(resolve, 100));
        this.isFlashing.set(false);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  async switchPlayer() {
    if (this.isAnimating()) return;
    this.playBeep();
    const s = this.session();
    if (!s) return;
    
    const nextPlayer = s.currentPlayer === 1 ? 2 : 1;
    const nextScore = nextPlayer === 1 ? s.p1Score : s.p2Score;

    this.session.update(current => current ? { 
      ...current, 
      currentPlayer: nextPlayer,
      phase: 'idle',
      currentHand: []
    } : null);
    
    this.displayScore.set(nextScore);
    this.heldIndices.set([false, false, false, false, false]);
    this.lastWin.set(null);
  }

  toggleHold(index: number) {
    if (this.session()?.phase !== 'dealt') return;
    this.playBeep(440);
    this.heldIndices.update(current => {
      const next = [...current];
      next[index] = !next[index];
      return next;
    });
  }

  toggleSound() {
    this.soundEnabled.update(s => !s);
    if (this.soundEnabled()) {
      this.playBeep();
    }
  }

  private playBeep(freq: number = 880) {
    if (this.soundEnabled()) {
      this.sound.beep(freq);
    }
  }
}
