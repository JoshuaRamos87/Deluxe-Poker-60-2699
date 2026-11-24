import { Injectable, signal, inject } from '@angular/core';
import { GameSession, Card, GamePhase, HandRank } from '../models/game.models';
import { SoundService } from './sound';
import { createDeck, shuffle, evaluateHand } from '../utils/poker-logic';

const STORAGE_KEY = 'retro-poker-state';

interface PersistedState {
  p1Score: number;
  p2Score: number;
  currentPlayer: 1 | 2;
  soundEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private sound = inject(SoundService);
  private animationToken = 0;
  private activeTimer: ReturnType<typeof setTimeout> | null = null;
  private activeResolve: (() => void) | null = null;
  private skipCountUp = false;

  // Signals
  session = signal<GameSession | null>(null);
  heldIndices = signal<boolean[]>([false, false, false, false, false]);
  visibleIndices = signal<boolean[]>([true, true, true, true, true]);
  winningIndices = signal<number[]>([]);
  isFlashing = signal<boolean>(false);
  displayScore = signal<number>(100);
  isAnimating = signal<boolean>(false);
  isCountingScore = signal<boolean>(false);
  soundEnabled = signal<boolean>(true);
  lastWin = signal<{ rank: HandRank, points: number } | null>(null);

  constructor() {
    this.initSession();
  }

  private initSession() {
    const persisted = this.loadPersistedState();
    this.soundEnabled.set(persisted.soundEnabled);
    const session: GameSession = {
      sessionId: Math.random().toString(36).substring(7),
      currentPlayer: persisted.currentPlayer,
      p1Score: persisted.p1Score,
      p2Score: persisted.p2Score,
      deck: [],
      currentHand: [],
      phase: 'idle',
    };
    this.session.set(session);
    this.displayScore.set(persisted.currentPlayer === 1 ? persisted.p1Score : persisted.p2Score);
  }

  private isValidScore(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;
  }

  private getStorage(): Storage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }

  private loadPersistedState(): PersistedState {
    const defaults: PersistedState = {
      p1Score: 100,
      p2Score: 100,
      currentPlayer: 1,
      soundEnabled: true,
    };

    const storage = this.getStorage();
    if (!storage) {
      return defaults;
    }

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<PersistedState> | null;
      if (!parsed || typeof parsed !== 'object') return defaults;

      return {
        p1Score: this.isValidScore(parsed.p1Score) ? parsed.p1Score : defaults.p1Score,
        p2Score: this.isValidScore(parsed.p2Score) ? parsed.p2Score : defaults.p2Score,
        currentPlayer: parsed.currentPlayer === 1 || parsed.currentPlayer === 2 ? parsed.currentPlayer : defaults.currentPlayer,
        soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : defaults.soundEnabled,
      };
    } catch {
      return defaults;
    }
  }

  private persistState() {
    const storage = this.getStorage();
    if (!storage) return;
    const s = this.session();
    if (!s) return;

    const payload: PersistedState = {
      p1Score: s.p1Score,
      p2Score: s.p2Score,
      currentPlayer: s.currentPlayer,
      soundEnabled: this.soundEnabled(),
    };

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }

  private cancelActiveSleep() {
    if (this.activeTimer !== null) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
    if (this.activeResolve) {
      const resolve = this.activeResolve;
      this.activeResolve = null;
      resolve();
    }
  }

  private async sleep(ms: number, token: number): Promise<boolean> {
    if (token !== this.animationToken) return false;
    await new Promise<void>(resolve => {
      this.activeResolve = resolve;
      this.activeTimer = setTimeout(() => {
        this.activeTimer = null;
        this.activeResolve = null;
        resolve();
      }, ms);
    });
    return token === this.animationToken;
  }

  skipScoreCount() {
    if (!this.isCountingScore()) return;
    this.skipCountUp = true;
    this.cancelActiveSleep();
  }

  async newGame() {
    this.animationToken++;
    this.cancelActiveSleep();
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
    this.isAnimating.set(false);
    this.isCountingScore.set(false);
    this.skipCountUp = false;
    this.winningIndices.set([]);
    this.isFlashing.set(false);
    this.session.set(session);
    this.displayScore.set(100);
    this.heldIndices.set([false, false, false, false, false]);
    this.visibleIndices.set([true, true, true, true, true]);
    this.lastWin.set(null);
    this.persistState();
  }

  async deal() {
    if (this.isAnimating()) return;
    const s = this.session();
    if (!s) return;

    // Prevent deal if player has no points to ante
    const currentScore = s.currentPlayer === 1 ? s.p1Score : s.p2Score;
    if (currentScore < 5) {
      return;
    }

    const token = ++this.animationToken;
    this.playBeep(1200);

    // Take Ante
    let p1Score = s.p1Score;
    let p2Score = s.p2Score;
    if (s.currentPlayer === 1) {
      p1Score = p1Score - 5;
    } else {
      p2Score = p2Score - 5;
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
    this.persistState();

    this.heldIndices.set([false, false, false, false, false]);
    this.lastWin.set(null);

    this.isAnimating.set(true);
    for (let i = 0; i < 5; i++) {
      const ok = await this.sleep(500, token);
      if (!ok) return;
      this.visibleIndices.update(v => {
        const next = [...v];
        next[i] = true;
        return next;
      });
      this.playBeep(880);
    }
    if (token === this.animationToken) {
      this.isAnimating.set(false);
    }
  }

  async draw() {
    if (this.isAnimating()) return;
    const s = this.session();
    if (!s || s.phase !== 'dealt') return;

    const token = ++this.animationToken;
    this.playBeep(1200);
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
    this.persistState();

    // Visuals: Hide non-held cards
    const currentVisible = [...this.heldIndices()];
    this.visibleIndices.set(currentVisible);

    // Sequential reveal for unheld cards
    for (let i = 0; i < 5; i++) {
      if (!this.heldIndices()[i]) {
        const ok = await this.sleep(500, token);
        if (!ok) return;
        this.visibleIndices.update(v => {
          const next = [...v];
          next[i] = true;
          return next;
        });
        this.playBeep(880);
      }
    }

    if (token !== this.animationToken) return;

    this.lastWin.set({ rank, points });
    this.winningIndices.set(winningIndices);

    if (points > 0) {
      const winOk = await this.playWinAnimation(token);
      if (!winOk) return;
    }

    const countOk = await this.animateScoreCount(targetScore, token);
    if (!countOk) return;

    if (token === this.animationToken) {
      this.isAnimating.set(false);
    }
  }

  async animateScoreCount(target: number, token: number = this.animationToken): Promise<boolean> {
    const current = this.displayScore();
    if (target <= current) {
      this.displayScore.set(target);
      return token === this.animationToken;
    }

    const step = Math.max(1, Math.ceil((target - current) / 50));
    this.skipCountUp = false;
    this.isCountingScore.set(true);

    try {
      while (this.displayScore() < target) {
        if (token !== this.animationToken) return false;
        if (this.skipCountUp) {
          this.displayScore.set(target);
          return true;
        }
        this.displayScore.set(Math.min(target, this.displayScore() + step));
        if (this.soundEnabled()) this.sound.playCountingBeep();
        if (this.displayScore() >= target) break;

        const ok = await this.sleep(40, token);
        if (!ok) return false;
        if (this.skipCountUp) {
          this.displayScore.set(target);
          return true;
        }
      }
      return token === this.animationToken;
    } finally {
      if (token === this.animationToken) {
        this.isCountingScore.set(false);
        this.skipCountUp = false;
      }
    }
  }

  async playWinAnimation(token: number = this.animationToken): Promise<boolean> {
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let note = 0; note < 3; note++) {
        if (token !== this.animationToken) return false;
        this.isFlashing.set(true);
        if (this.soundEnabled()) this.sound.playWinNote(note);
        const onOk = await this.sleep(100, token);
        if (!onOk) return false;
        this.isFlashing.set(false);
        const offOk = await this.sleep(100, token);
        if (!offOk) return false;
      }
      const pauseOk = await this.sleep(150, token);
      if (!pauseOk) return false;
    }
    return token === this.animationToken;
  }

  async switchPlayer() {
    if (this.isAnimating()) return;
    const s = this.session();
    if (!s) return;
    this.playBeep();

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
    this.visibleIndices.set([true, true, true, true, true]);
    this.winningIndices.set([]);
    this.isFlashing.set(false);
    this.lastWin.set(null);
    this.persistState();
  }

  toggleHold(index: number) {
    if (this.isAnimating() || this.session()?.phase !== 'dealt') return;
    this.playBeep(440);
    this.heldIndices.update(current => {
      const next = [...current];
      next[index] = !next[index];
      return next;
    });
  }

  toggleSound() {
    this.soundEnabled.update(s => !s);
    this.persistState();
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
