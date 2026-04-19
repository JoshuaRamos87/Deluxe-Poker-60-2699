import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
  }

  beep(freq: number = 880, duration: number = 0.1) {
    this.init();
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    oscillator.type = 'square'; // Piezo buzzer sound
    oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + duration);
  }

  playWinNote(noteIndex: number) {
    this.init();
    if (!this.audioCtx) return;
    
    // Notes for "beep-^dee-deep" melody
    // sequence: 0:beep(880), 1:^dee(1108.73), 2:deep(880)
    const freqs = [880, 1108.73, 880];
    const freq = freqs[noteIndex % 3];
    this.beep(freq, 0.2);
  }

  playCountingBeep() {
    this.init();
    if (!this.audioCtx) return;
    // Lower frequency, short duration, and lower volume for rapid counting
    this.beep(660, 0.03);
  }

  playWin() {
    // This is the generic old win, we will use GameService to sync the new one
  }
}
