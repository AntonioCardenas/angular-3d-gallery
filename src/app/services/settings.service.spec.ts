import { test, expect, describe, vi } from '../../test-setup/fixtures';
import { SettingsService } from './settings.service';

/**
 * SettingsService tests — Browser Mode (Playwright).
 *
 * Migrated from TestBed + mutable beforeEach + JSDOM window.location hack
 * to the extended `test` with Angular fixtures.
 *
 * Key improvements:
 *   - localStorage is a REAL browser API in Playwright — no JSDOM shim.
 *   - Fixtures auto-manage TestBed lifecycle (angularEnv).
 *   - window.location.reload is stubbed via vi.spyOn with clean per-test scope
 *     (mockReset: true in config).
 *   - No shared mutable `let service` variable.
 */
describe('SettingsService', () => {
  test('should initialize with default values (false if not in localStorage)', ({ angularEnv }) => {
    localStorage.clear();
    const service = angularEnv.inject(SettingsService);
    expect(service.useWebGPU()).toBe(false);
    expect(service.showFPS()).toBe(false);
  });

  test('should initialize from localStorage if present', ({ angularEnv }) => {
    localStorage.setItem('useWebGPU', 'true');
    localStorage.setItem('showFPS', 'true');

    const service = angularEnv.inject(SettingsService);
    expect(service.useWebGPU()).toBe(true);
    expect(service.showFPS()).toBe(true);

    // Clean up after ourselves
    localStorage.clear();
  });

  test('should toggle showFPS and save to localStorage', ({ angularEnv }) => {
    localStorage.clear();
    const service = angularEnv.inject(SettingsService);
    expect(service.showFPS()).toBe(false);

    service.toggleFPS();
    expect(service.showFPS()).toBe(true);
    expect(localStorage.getItem('showFPS')).toBe('true');

    service.toggleFPS();
    expect(service.showFPS()).toBe(false);
    expect(localStorage.getItem('showFPS')).toBe('false');

    localStorage.clear();
  });

  test('should toggle WebGPU, save to localStorage and reload window', ({ angularEnv }) => {
    localStorage.clear();

    const service = angularEnv.inject(SettingsService);

    // Spy on the isolated reload method to prevent actual page navigation
    // and verify it's called when toggling WebGPU.
    const reloadSpy = vi.spyOn(service, 'reloadPage' as any).mockImplementation(() => {});

    expect(service.useWebGPU()).toBe(false);

    service.toggleWebGPU();
    expect(service.useWebGPU()).toBe(true);
    expect(localStorage.getItem('useWebGPU')).toBe('true');
    expect(reloadSpy).toHaveBeenCalled();

    localStorage.clear();
  });
});
