import { test, expect, describe, vi } from '../../test-setup/fixtures';
import { DeviceService } from './device.service';

/**
 * DeviceService tests — Browser Mode (Playwright).
 *
 * Migrated from TestBed + JSDOM hacks (Object.defineProperty on navigator/window)
 * to the extended `test` with Angular fixtures.
 *
 * In Browser Mode (Playwright/Chromium), `matchMedia` and `navigator` are real
 * browser APIs. We still mock them for controlled assertions, but through
 * vi.spyOn instead of fragile Object.defineProperty overrides.
 *
 * Key improvements:
 *   - No mutable `let matchMediaMock` / `let originalTouchPoints` shared state.
 *   - Fixtures handle TestBed lifecycle (auto-cleanup via onCleanup).
 *   - `mockReset: true` in vitest.config.ts prevents spy bleeding.
 */
describe('DeviceService', () => {
  test('should detect mobile when maxTouchPoints is > 0', ({ angularEnv }) => {
    // Stub navigator.maxTouchPoints for this test
    vi.stubGlobal('navigator', {
      ...navigator,
      maxTouchPoints: 1,
    });

    const service = angularEnv.inject(DeviceService);
    expect(service.isMobile()).toBe(true);
  });

  test('should detect mobile when matchMedia pointer is coarse', ({ angularEnv }) => {
    // Stub maxTouchPoints to 0 so only matchMedia matters
    vi.stubGlobal('navigator', {
      ...navigator,
      maxTouchPoints: 0,
    });

    // Stub matchMedia to report coarse pointer
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const service = angularEnv.inject(DeviceService);
    expect(service.isMobile()).toBe(true);
  });

  test('should detect desktop when no touch points and fine pointer', ({ angularEnv }) => {
    vi.stubGlobal('navigator', {
      ...navigator,
      maxTouchPoints: 0,
    });

    // Default matchMedia returns matches: false (fine pointer)
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const service = angularEnv.inject(DeviceService);
    expect(service.isMobile()).toBe(false);
  });
});
