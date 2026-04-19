import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameSession, Card, GamePhase, HandRank } from '../models/game.models';
import { firstValueFrom } from 'rxjs';
import { SoundService } from './sound';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';
  private http = inject(HttpClient);
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
    const res = await firstValueFrom(this.http.post<GameSession>(`${this.apiUrl}/new`, {}));
    this.session.set(res);
    this.displayScore.set(100);
    this.heldIndices.set([false, false, false, false, false]);
    this.visibleIndices.set([true, true, true, true, true]);
    this.lastWin.set(null);
  }

  async deal() {
    if (this.isAnimating()) return;
    this.playBeep(1200); // Higher pitch for Deal/Draw click
    const s = this.session();
    if (!s) return;
    const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${s.sessionId}/deal`, {}));
    
    // Hide all cards initially
    this.visibleIndices.set([false, false, false, false, false]);
    this.winningIndices.set([]);
    this.isFlashing.set(false);
    this.session.update(current => current ? { ...current, ...res, currentHand: res.currentHand } : null);
    this.heldIndices.set([false, false, false, false, false]);
    this.lastWin.set(null);

    this.isAnimating.set(true);
    // Sequential reveal
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      this.visibleIndices.update(v => {
        const next = [...v];
        next[i] = true;
        return next;
      });
      this.playBeep(880); // Standard reveal beep
    }
    this.isAnimating.set(false);
  }

  async draw() {
    if (this.isAnimating()) return;
    this.playBeep(1200); // Higher pitch for Deal/Draw click
    const s = this.session();
    if (!s) return;
    const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${s.sessionId}/draw`, { heldIndices: this.heldIndices() }));
    console.log('Backend Response:', res);
    
    this.isAnimating.set(true);

    // Hide non-held cards
    const currentVisible = [...this.heldIndices()];
    this.visibleIndices.set(currentVisible);

    const finalHand = res.finalHand;
    const targetScore = s.currentPlayer === 1 ? res.p1Score : res.p2Score;

    this.session.update(current => current ? { 
      ...current, 
      currentHand: finalHand, 
      p1Score: res.p1Score, 
      p2Score: res.p2Score, 
      phase: res.phase 
    } : null);

    // Sequential reveal for unheld cards
    for (let i = 0; i < 5; i++) {
      if (!this.heldIndices()[i]) {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.visibleIndices.update(v => {
          const next = [...v];
          next[i] = true;
          return next;
        });
        this.playBeep(880); // Standard reveal beep
      }
    }

    this.lastWin.set({ rank: res.handRank, points: res.pointsWon });
    this.winningIndices.set(res.winningIndices || []);
    
    if (res.pointsWon > 0) {
      await this.playWinAnimation();
    }

    // Finally tally score
    await this.animateScoreCount(targetScore);
    
    this.isAnimating.set(false);
  }

  async animateScoreCount(target: number) {
    const current = this.displayScore();
    
    if (target <= current) {
      // Immediate update for decrements or no change
      this.displayScore.set(target);
      return;
    }

    // Incremental animation only for wins
    while (this.displayScore() < target) {
      this.displayScore.set(this.displayScore() + 1);
      if (this.soundEnabled()) this.sound.playCountingBeep();
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  }

  async playWinAnimation() {
    // beep-^dee-deep beep-^dee-deep (played twice)
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let note = 0; note < 3; note++) {
        this.isFlashing.set(true);
        if (this.soundEnabled()) this.sound.playWinNote(note);
        await new Promise(resolve => setTimeout(resolve, 150));
        this.isFlashing.set(false);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      await new Promise(resolve => setTimeout(resolve, 200)); // gap between loops
    }
  }

  async switchPlayer() {
    if (this.isAnimating()) return;
    this.playBeep();
    const s = this.session();
    if (!s) return;
    const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${s.sessionId}/switch-player`, {}));
    this.session.update(current => current ? { ...current, ...res, currentHand: [] } : null);
    this.displayScore.set(s.currentPlayer === 1 ? res.p2Score : res.p1Score);
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

  private playWin() {
    if (this.soundEnabled()) {
      this.sound.playWin();
    }
  }
}
