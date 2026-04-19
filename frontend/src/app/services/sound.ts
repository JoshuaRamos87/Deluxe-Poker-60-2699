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

  playWin() {
    this.beep(440, 0.1);
    setTimeout(() => this.beep(554.37, 0.1), 100);
    setTimeout(() => this.beep(659.25, 0.2), 200);
  }
}
