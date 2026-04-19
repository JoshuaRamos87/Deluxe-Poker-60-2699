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
    const phase = this.gameService.session()?.phase;
    if (phase === 'idle' || phase === 'gameover') {
      this.gameService.deal();
    } else if (phase === 'dealt') {
      this.gameService.draw();
    }
  }
}
