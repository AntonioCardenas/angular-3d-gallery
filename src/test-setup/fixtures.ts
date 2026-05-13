/**
 * Global Test Fixtures — Context API (Playwright-style Object Syntax)
 *
 * Inspired by KI vitest-advanced-patterns §3 (Context & Fixtures).
 * Uses the Object Syntax with `use` callback (Vitest 4.x API).
 *
 * Replaces mutable `beforeEach` / `afterEach` with composable, typed
 * fixtures that auto-cleanup after `use`.
 *
 * Usage:
 *   import { test, expect } from '../test-setup/fixtures';
 *   test('...', async ({ angularEnv }) => { ... });
 */
import { test as base } from 'vitest';
import { TestBed } from '@angular/core/testing';

/* ─── Types ─────────────────────────────────────────────────────────── */

/** Angular testing environment managed per-test */
export interface AngularEnv {
  /** Pre-configured TestBed — already compiled, ready for inject/createComponent */
  testBed: typeof TestBed;
  /** Convenience: inject a token without touching TestBed directly */
  inject: typeof TestBed.inject;
}

/* ─── Extended test ─────────────────────────────────────────────────── */

/**
 * Extended `test` that provides an `angularEnv` fixture.
 *
 * The fixture:
 *  - Resets TestBed before the test (clean DI container).
 *  - Registers automatic cleanup (TestBed.resetTestingModule) via teardown after `use`.
 *  - Eliminates shared mutable variables across tests.
 */
export const test = base.extend<{ angularEnv: AngularEnv }>({
  angularEnv: async ({}, use) => {
    // Fresh TestBed per test — no bleeding state
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    await TestBed.compileComponents();

    const env: AngularEnv = {
      testBed: TestBed,
      inject: TestBed.inject.bind(TestBed),
    };

    // Pass the fixture to the test. Code after `use` runs as teardown.
    await use(env);

    // Cleanup: reset TestBed after the test completes
    TestBed.resetTestingModule();
  },
});

/* ─── Re-exports for convenience ────────────────────────────────────── */
export { expect, describe, vi, beforeEach, afterEach } from 'vitest';
