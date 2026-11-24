import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GameService } from './game';
import { SoundService } from './sound';

describe('GameService', () => {
  let service: GameService;
  let soundMock: {
    beep: ReturnType<typeof vi.fn>;
    playWinNote: ReturnType<typeof vi.fn>;
    playCountingBeep: ReturnType<typeof vi.fn>;
  };

  function createService(): GameService {
    TestBed.resetTestingModule();
    soundMock = {
      beep: vi.fn(),
      playWinNote: vi.fn(),
      playCountingBeep: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        GameService,
        {
          provide: SoundService,
          useValue: soundMock,
        },
      ],
    });
    return TestBed.inject(GameService);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    service = createService();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should be created and auto-initialize session without playing a startup beep', () => {
    expect(service).toBeTruthy();
    expect(service.session()).not.toBeNull();
    expect(service.session()?.phase).toBe('idle');
    expect(service.session()?.p1Score).toBe(100);
    expect(service.session()?.p2Score).toBe(100);
    expect(service.displayScore()).toBe(100);
    expect(soundMock.beep).not.toHaveBeenCalled();
  });

  it('should deduct ante at the start of deal() and prevent deal with < 5 points', async () => {
    await service.newGame();
    expect(service.displayScore()).toBe(100);

    const dealPromise = service.deal();
    expect(service.displayScore()).toBe(95);
    expect(service.session()?.p1Score).toBe(95);
    expect(service.isAnimating()).toBe(true);

    await vi.advanceTimersByTimeAsync(2500);
    await dealPromise;
    expect(service.isAnimating()).toBe(false);
    expect(service.visibleIndices()).toEqual([true, true, true, true, true]);

    // Simulate 0 points state
    service.session.update(s => (s ? { ...s, p1Score: 0, phase: 'idle' } : null));
    service.displayScore.set(0);

    // Attempt to deal with 0 points
    await service.deal();
    expect(service.session()?.phase).toBe('idle');
  });

  it('should execute draw() after deal() without deducting further ante', async () => {
    await service.newGame();

    const dealPromise = service.deal();
    await vi.advanceTimersByTimeAsync(2500);
    await dealPromise;
    expect(service.session()?.p1Score).toBe(95);
    expect(service.session()?.phase).toBe('dealt');

    const drawPromise = service.draw();
    await vi.runAllTimersAsync();
    await drawPromise;

    expect(service.session()?.phase).toBe('gameover');
    expect(service.isAnimating()).toBe(false);
    expect(service.session()?.p1Score).toBeGreaterThanOrEqual(95);
    expect(service.displayScore()).toBe(service.session()?.p1Score);
  });

  it('should cancel in-flight deal() animations and reset state when newGame() is called', async () => {
    const dealPromise = service.deal();
    expect(service.isAnimating()).toBe(true);
    await vi.advanceTimersByTimeAsync(500);

    service.winningIndices.set([0, 1]);
    service.isFlashing.set(true);

    await service.newGame();
    await vi.advanceTimersByTimeAsync(5000);
    await dealPromise;

    expect(service.session()?.phase).toBe('idle');
    expect(service.session()?.p1Score).toBe(100);
    expect(service.displayScore()).toBe(100);
    expect(service.isAnimating()).toBe(false);
    expect(service.isCountingScore()).toBe(false);
    expect(service.winningIndices()).toEqual([]);
    expect(service.isFlashing()).toBe(false);
    expect(service.visibleIndices()).toEqual([true, true, true, true, true]);
  });

  it('should scale animateScoreCount() for large wins to finish within ~2 seconds', async () => {
    service.displayScore.set(95);

    const countPromise = service.animateScoreCount(5095);
    expect(service.isCountingScore()).toBe(true);

    await vi.advanceTimersByTimeAsync(2100);
    const completed = await countPromise;

    expect(completed).toBe(true);
    expect(service.displayScore()).toBe(5095);
    expect(service.isCountingScore()).toBe(false);
  });

  it('should snap immediately to target when skipScoreCount() is called', async () => {
    service.displayScore.set(95);

    const countPromise = service.animateScoreCount(5095);
    expect(service.isCountingScore()).toBe(true);
    await vi.advanceTimersByTimeAsync(40);

    service.skipScoreCount();
    const completed = await countPromise;

    expect(completed).toBe(true);
    expect(service.displayScore()).toBe(5095);
    expect(service.isCountingScore()).toBe(false);
  });

  it('should persist state to localStorage and restore it on startup', () => {
    service.toggleSound(); // false
    service.session.update(s => (s ? { ...s, p1Score: 150, p2Score: 80 } : null));
    service.switchPlayer(); // switches to P2 and persists

    const restored = createService();
    expect(restored.session()?.currentPlayer).toBe(2);
    expect(restored.session()?.p1Score).toBe(150);
    expect(restored.session()?.p2Score).toBe(80);
    expect(restored.displayScore()).toBe(80);
    expect(restored.soundEnabled()).toBe(false);
  });

  it('should fall back safely on corrupt or invalid localStorage data', () => {
    localStorage.setItem('retro-poker-state', '{not-valid-json');
    const fromCorrupt = createService();
    expect(fromCorrupt.session()?.p1Score).toBe(100);
    expect(fromCorrupt.session()?.p2Score).toBe(100);
    expect(fromCorrupt.session()?.currentPlayer).toBe(1);
    expect(fromCorrupt.soundEnabled()).toBe(true);

    localStorage.setItem(
      'retro-poker-state',
      JSON.stringify({ p1Score: -10, p2Score: 12.5, currentPlayer: 99, soundEnabled: 'yes' }),
    );
    const fromInvalid = createService();
    expect(fromInvalid.session()?.p1Score).toBe(100);
    expect(fromInvalid.session()?.p2Score).toBe(100);
    expect(fromInvalid.session()?.currentPlayer).toBe(1);
    expect(fromInvalid.soundEnabled()).toBe(true);
  });

  it('should reset scores in newGame() while preserving mute preference', async () => {
    service.toggleSound(); // false
    service.session.update(s => (s ? { ...s, p1Score: 45, p2Score: 20, currentPlayer: 2 } : null));

    await service.newGame();

    expect(service.session()?.p1Score).toBe(100);
    expect(service.session()?.p2Score).toBe(100);
    expect(service.session()?.currentPlayer).toBe(1);
    expect(service.soundEnabled()).toBe(false);

    const restored = createService();
    expect(restored.session()?.p1Score).toBe(100);
    expect(restored.soundEnabled()).toBe(false);
  });

  it('should clear winningIndices, isFlashing, and restore visibleIndices on switchPlayer()', async () => {
    service.winningIndices.set([0, 2, 4]);
    service.isFlashing.set(true);
    service.visibleIndices.set([false, false, false, false, false]);

    await service.switchPlayer();

    expect(service.session()?.currentPlayer).toBe(2);
    expect(service.winningIndices()).toEqual([]);
    expect(service.isFlashing()).toBe(false);
    expect(service.visibleIndices()).toEqual([true, true, true, true, true]);
  });

  it('should initialize cleanly and not throw when localStorage getter throws SecurityError', async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });

    try {
      const restrictedService = createService();
      expect(restrictedService.session()?.p1Score).toBe(100);
      expect(restrictedService.session()?.p2Score).toBe(100);
      expect(restrictedService.session()?.currentPlayer).toBe(1);
      expect(restrictedService.soundEnabled()).toBe(true);
      expect(restrictedService.displayScore()).toBe(100);

      expect(() => restrictedService.toggleSound()).not.toThrow();
      expect(restrictedService.soundEnabled()).toBe(false);
      await expect(restrictedService.newGame()).resolves.toBeUndefined();
      expect(restrictedService.session()?.p1Score).toBe(100);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
      }
    }
  });
});
