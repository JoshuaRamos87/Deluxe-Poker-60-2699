import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioCtx: AudioContext | null = null;

  private init(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      try {
        this.audioCtx = new AudioCtx();
      } catch {
        return null;
      }
    }

    if (this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume().catch(() => {});
      } catch {
        // Ignore resume errors in restricted environments
      }
    }

    return this.audioCtx;
  }

  beep(freq: number = 880, duration: number = 0.1) {
    const ctx = this.init();
    if (!ctx) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square'; // Piezo buzzer sound
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  playWinNote(noteIndex: number) {
    // Notes for "beep-^dee-deep" melody
    // sequence: 0:beep(880), 1:^dee(1108.73), 2:deep(1308.73)
    const freqs = [880, 1108.73, 1308.73];
    const freq = freqs[noteIndex % 3];
    this.beep(freq, 0.1);
  }

  playCountingBeep() {
    // Lower frequency, short duration, and lower volume for rapid counting
    this.beep(660, 0.03);
  }

  playWin() {
    // This is the generic old win, we will use GameService to sync the new one
  }
}
