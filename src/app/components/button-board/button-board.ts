import { Component, inject } from '@angular/core';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-button-board',
  standalone: true,
  imports: [],
  templateUrl: './button-board.html',
  styleUrl: './button-board.scss',
  host: {
    '(window:keydown)': 'onKeyDown($event)',
  },
})
export class ButtonBoardComponent {
  gameService = inject(GameService);

  onDealDraw() {
    if (this.gameService.isCountingScore()) {
      this.gameService.skipScoreCount();
      return;
    }

    const s = this.gameService.session();
    if (!s) {
      this.gameService.newGame();
      this.gameService.deal();
      return;
    }

    if (s.phase === 'idle' || s.phase === 'gameover') {
      this.gameService.deal();
    } else if (s.phase === 'dealt') {
      this.gameService.draw();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const target = event.target instanceof HTMLElement ? event.target : null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    if (typeof document !== 'undefined' && document.querySelector('[role="dialog"]')) {
      return;
    }

    if (target?.closest('button, a, [role="button"]') && (event.key === ' ' || event.key === 'Enter')) {
      return;
    }

    if (event.key >= '1' && event.key <= '5') {
      this.gameService.toggleHold(Number(event.key) - 1);
      return;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.onDealDraw();
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'm':
        this.gameService.toggleSound();
        break;
      case 'p':
        this.gameService.switchPlayer();
        break;
      case 'n':
        this.gameService.newGame();
        break;
    }
  }
}
