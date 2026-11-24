import { Component, inject, computed } from '@angular/core';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-lcd-screen',
  standalone: true,
  imports: [],
  templateUrl: './lcd-screen.html',
  styleUrl: './lcd-screen.scss'
})
export class LcdScreenComponent {
  gameService = inject(GameService);
  readonly cardSlots = [0, 1, 2, 3, 4];

  isTotalGameOver = computed(() => {
    const s = this.gameService.session();
    if (!s) return false;
    if (s.phase === 'dealt' || this.gameService.isAnimating()) return false;
    const score = s.currentPlayer === 1 ? s.p1Score : s.p2Score;
    return score < 5;
  });

  getRankDisplay(rank: number): string {
    if (rank === 10) return '0';
    if (rank === 11) return 'J';
    if (rank === 12) return 'Q';
    if (rank === 13) return 'K';
    if (rank === 14) return 'A';
    return rank.toString();
  }

  getSuitDisplay(suit: string): string {
    switch (suit) {
      case 'S': return '♠';
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      default: return '';
    }
  }
}
