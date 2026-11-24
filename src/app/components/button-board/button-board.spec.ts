import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ButtonBoardComponent } from './button-board';
import { GameService } from '../../services/game';

describe('ButtonBoardComponent', () => {
  let component: ButtonBoardComponent;
  let fixture: ComponentFixture<ButtonBoardComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ButtonBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonBoardComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all 9 hardware buttons with type="button" and ARIA labels', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(compiled.querySelectorAll('button'));
    expect(buttons.length).toBe(9);
    for (const btn of buttons) {
      expect(btn.type).toBe('button');
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('should call skipScoreCount() instead of deal/draw when score is counting up', () => {
    const skipSpy = vi.spyOn(gameService, 'skipScoreCount').mockImplementation(() => {});
    const dealSpy = vi.spyOn(gameService, 'deal').mockResolvedValue();
    const drawSpy = vi.spyOn(gameService, 'draw').mockResolvedValue();

    gameService.isCountingScore.set(true);
    component.onDealDraw();

    expect(skipSpy).toHaveBeenCalledTimes(1);
    expect(dealSpy).not.toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should dispatch deal() in idle/gameover and draw() in dealt phase', () => {
    const dealSpy = vi.spyOn(gameService, 'deal').mockResolvedValue();
    const drawSpy = vi.spyOn(gameService, 'draw').mockResolvedValue();

    gameService.session.update(s => (s ? { ...s, phase: 'idle' } : null));
    component.onDealDraw();
    expect(dealSpy).toHaveBeenCalledTimes(1);

    gameService.session.update(s => (s ? { ...s, phase: 'dealt' } : null));
    component.onDealDraw();
    expect(drawSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard shortcuts 1-5, Space, Enter, M, P, N', () => {
    const holdSpy = vi.spyOn(gameService, 'toggleHold').mockImplementation(() => {});
    const dealSpy = vi.spyOn(gameService, 'deal').mockResolvedValue();
    const soundSpy = vi.spyOn(gameService, 'toggleSound').mockImplementation(() => {});
    const playerSpy = vi.spyOn(gameService, 'switchPlayer').mockResolvedValue();
    const newGameSpy = vi.spyOn(gameService, 'newGame').mockResolvedValue();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    expect(holdSpy).toHaveBeenNthCalledWith(1, 0);
    expect(holdSpy).toHaveBeenNthCalledWith(2, 4);

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    window.dispatchEvent(spaceEvent);
    expect(spaceEvent.defaultPrevented).toBe(true);
    expect(dealSpy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
    expect(soundSpy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'P' }));
    expect(playerSpy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
    expect(newGameSpy).toHaveBeenCalledTimes(1);
  });

  it('should ignore keyboard shortcuts on repeat, modifier keys, or when a dialog is open', () => {
    const newGameSpy = vi.spyOn(gameService, 'newGame').mockResolvedValue();
    const soundSpy = vi.spyOn(gameService, 'toggleSound').mockImplementation(() => {});

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', repeat: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', metaKey: true }));
    expect(newGameSpy).not.toHaveBeenCalled();
    expect(soundSpy).not.toHaveBeenCalled();

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    document.body.appendChild(dialog);
    try {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
      expect(newGameSpy).not.toHaveBeenCalled();
    } finally {
      dialog.remove();
    }
  });

  it('should not intercept Space or Enter when focus is on interactive hardware buttons', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const onDealDrawSpy = vi.spyOn(component, 'onDealDraw');
    const dealSpy = vi.spyOn(gameService, 'deal').mockResolvedValue();
    const drawSpy = vi.spyOn(gameService, 'draw').mockResolvedValue();

    const targetButtons = [
      compiled.querySelector<HTMLButtonElement>('button[aria-label="New Game"]'),
      compiled.querySelector<HTMLButtonElement>('button[aria-label="Hold card 1"]'),
      compiled.querySelector<HTMLButtonElement>('.deal-draw-btn'),
    ];

    for (const btn of targetButtons) {
      expect(btn).toBeTruthy();
      btn!.focus();
      for (const key of ['Enter', ' ']) {
        const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        btn!.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
      }
    }

    expect(onDealDrawSpy).not.toHaveBeenCalled();
    expect(dealSpy).not.toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should update Deal/Draw aria-label for Deal, Draw, and Skip score count states', () => {
    fixture.detectChanges();
    const dealDrawBtn = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.deal-draw-btn');
    expect(dealDrawBtn?.getAttribute('aria-label')).toBe('Deal');

    gameService.session.update(s => (s ? { ...s, phase: 'dealt' } : null));
    fixture.detectChanges();
    expect(dealDrawBtn?.getAttribute('aria-label')).toBe('Draw');

    gameService.isCountingScore.set(true);
    fixture.detectChanges();
    expect(dealDrawBtn?.getAttribute('aria-label')).toBe('Skip score count');
  });
});
