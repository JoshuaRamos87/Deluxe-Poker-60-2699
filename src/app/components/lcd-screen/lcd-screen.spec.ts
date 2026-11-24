import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LcdScreenComponent } from './lcd-screen';
import { GameService } from '../../services/game';

describe('LcdScreenComponent', () => {
  let component: LcdScreenComponent;
  let fixture: ComponentFixture<LcdScreenComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LcdScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LcdScreenComponent);
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

  it('should NOT show TOTAL GAME OVER when score drops to 0 during dealt phase', () => {
    gameService.session.update(s => (s ? { ...s, p1Score: 0, phase: 'dealt' } : null));
    gameService.isAnimating.set(false);
    fixture.detectChanges();

    expect(component.isTotalGameOver()).toBe(false);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.lcd-message')?.textContent?.trim()).not.toBe('TOTAL GAME OVER');
    expect(compiled.querySelector('.lcd-hand')).toBeTruthy();
  });

  it('should NOT show TOTAL GAME OVER while isAnimating is true during gameover phase', () => {
    gameService.session.update(s => (s ? { ...s, p1Score: 0, phase: 'gameover' } : null));
    gameService.isAnimating.set(true);
    fixture.detectChanges();

    expect(component.isTotalGameOver()).toBe(false);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.lcd-hand')).toBeTruthy();
  });

  it('should show TOTAL GAME OVER and hide cards when score < 5 in gameover/idle and not animating', () => {
    gameService.session.update(s => (s ? { ...s, p1Score: 0, phase: 'gameover' } : null));
    gameService.isAnimating.set(false);
    fixture.detectChanges();

    expect(component.isTotalGameOver()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.lcd-message')?.textContent?.trim()).toBe('TOTAL GAME OVER');
    expect(compiled.querySelector('.lcd-hand')).toBeNull();
  });

  it('should render dealt cards, tens digit, and HELD label', () => {
    gameService.session.update(s =>
      s
        ? {
            ...s,
            phase: 'dealt',
            currentHand: [
              { suit: 'S', rank: 10 },
              { suit: 'H', rank: 14 },
              { suit: 'D', rank: 13 },
              { suit: 'C', rank: 12 },
              { suit: 'S', rank: 11 },
            ],
          }
        : null,
    );
    gameService.visibleIndices.set([true, true, true, true, true]);
    gameService.heldIndices.set([true, false, false, false, false]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const slots = compiled.querySelectorAll('.lcd-card-slot');
    expect(slots.length).toBe(5);
    expect(slots[0].querySelector('.tens-digit')?.textContent).toBe('1');
    expect(slots[0].querySelector('.card-rank')?.textContent).toBe('0');
    expect(slots[0].querySelector('.hold-label')?.textContent).toBe('HELD');
    expect(slots[1].querySelector('.card-rank')?.textContent).toBe('A');
  });
});
