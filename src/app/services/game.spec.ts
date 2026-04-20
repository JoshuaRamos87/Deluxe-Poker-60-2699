import { TestBed } from '@angular/core/testing';
import { GameService } from './game';
import { SoundService } from './sound';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        {
          provide: SoundService,
          useValue: {
            beep: () => {},
            playWinNote: () => {},
            playCountingBeep: () => {}
          }
        }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should deduct ante at the start of deal()', async () => {
    await service.newGame();
    expect(service.displayScore()).toBe(100);
    
    // Start deal - should deduct ante immediately
    service.deal();
    expect(service.displayScore()).toBe(95);
    expect(service.session()?.p1Score).toBe(95);
  });

  it('should not deduct further ante during draw()', async () => {
    await service.newGame();
    service.deal(); 
    expect(service.session()?.p1Score).toBe(95);

    // Perform draw
    service.draw();
    
    // Score should be 95 + points. Since we don't know the points, 
    // we just check it's not 90.
    expect(service.session()?.p1Score).toBeGreaterThanOrEqual(95);
  });
});
