import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SoundService } from './sound';

describe('SoundService', () => {
  let service: SoundService;
  const originalAudioContext = window.AudioContext;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  afterEach(() => {
    Object.defineProperty(window, 'AudioContext', {
      value: originalAudioContext,
      configurable: true,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resume a suspended AudioContext before scheduling a beep', () => {
    const resume = vi.fn().mockResolvedValue(undefined);
    const start = vi.fn();
    const stop = vi.fn();
    const connect = vi.fn();

    class MockAudioContext {
      state: AudioContextState = 'suspended';
      currentTime = 0;
      destination = {};
      resume = resume;
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn() },
          connect,
          start,
          stop,
        };
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect,
        };
      }
    }

    Object.defineProperty(window, 'AudioContext', {
      value: MockAudioContext,
      configurable: true,
      writable: true,
    });

    service.beep(880, 0.1);

    expect(resume).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('should swallow rejected resume() promises without throwing', async () => {
    const resume = vi.fn().mockRejectedValue(new Error('NotAllowedError'));

    class MockAudioContext {
      state: AudioContextState = 'suspended';
      currentTime = 0;
      destination = {};
      resume = resume;
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        };
      }
    }

    Object.defineProperty(window, 'AudioContext', {
      value: MockAudioContext,
      configurable: true,
      writable: true,
    });

    expect(() => service.beep(880, 0.1)).not.toThrow();
    expect(resume).toHaveBeenCalledTimes(1);
    await Promise.resolve();
  });

  it('should handle missing AudioContext gracefully without throwing', () => {
    Object.defineProperty(window, 'AudioContext', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(() => service.beep(880, 0.1)).not.toThrow();
    expect(() => service.playWinNote(0)).not.toThrow();
    expect(() => service.playCountingBeep()).not.toThrow();
  });
});
