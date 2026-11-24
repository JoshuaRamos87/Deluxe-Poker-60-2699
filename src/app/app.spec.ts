import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the device shell and instructions button', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-device-shell')).toBeTruthy();
    const infoBtn = compiled.querySelector<HTMLButtonElement>('.info-btn');
    expect(infoBtn).toBeTruthy();
    expect(infoBtn?.type).toBe('button');
    expect(infoBtn?.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open the rules dialog and close it on Escape', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const infoBtn = compiled.querySelector<HTMLButtonElement>('.info-btn')!;
    infoBtn.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.textContent).toContain('Retro Poker 60-2699');
    expect(infoBtn.getAttribute('aria-expanded')).toBe('true');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
    expect(infoBtn.getAttribute('aria-expanded')).toBe('false');
  });
});
