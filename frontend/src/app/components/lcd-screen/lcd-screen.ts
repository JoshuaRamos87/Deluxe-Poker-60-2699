import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-lcd-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lcd-screen.html',
  styleUrl: './lcd-screen.scss'
})
export class LcdScreenComponent {
  gameService = inject(GameService);
  
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
