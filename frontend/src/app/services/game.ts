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
  soundEnabled = signal<boolean>(true);
  lastWin = signal<{ rank: HandRank, points: number } | null>(null);

  async newGame() {
    this.playBeep();
    const res = await firstValueFrom(this.http.post<GameSession>(`${this.apiUrl}/new`, {}));
    this.session.set(res);
    this.heldIndices.set([false, false, false, false, false]);
    this.lastWin.set(null);
  }

  async deal() {
    this.playBeep();
    const s = this.session();
    if (!s) return;
    const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${s.sessionId}/deal`, {}));
    this.session.update(current => current ? { ...current, ...res } : null);
    this.heldIndices.set([false, false, false, false, false]);
    this.lastWin.set(null);
  }

  async draw() {
    this.playBeep();
    const s = this.session();
    if (!s) return;
    const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${s.sessionId}/draw`, { heldIndices: this.heldIndices() }));
    this.session.update(current => current ? { 
      ...current, 
      currentHand: res.finalHand, 
      p1Score: res.p1Score, 
      p2Score: res.p2Score, 
      phase: res.phase 
    } : null);
    this.lastWin.set({ rank: res.handRank, points: res.pointsWon });
    if (res.pointsWon > 0) {
      this.playWin();
    }
  }

  async switchPlayer() {
    this.playBeep();
    const s = this.session();
    if (!s) return;
    const res = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${s.sessionId}/switch-player`, {}));
    this.session.update(current => current ? { ...current, ...res, currentHand: [] } : null);
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
