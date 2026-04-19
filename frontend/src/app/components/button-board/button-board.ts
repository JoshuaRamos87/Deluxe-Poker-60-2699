import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-button-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-board.html',
  styleUrl: './button-board.scss'
})
export class ButtonBoardComponent {
  gameService = inject(GameService);

  onDealDraw() {
    const s = this.gameService.session();
    const score = s?.currentPlayer === 1 ? s?.p1Score : s?.p2Score;
    
    if (score === 0) return; // Completely Game Over for this player session

    const phase = s?.phase;
    if (phase === 'idle' || phase === 'gameover') {
      this.gameService.deal();
    } else if (phase === 'dealt') {
      this.gameService.draw();
    }
  }
}
