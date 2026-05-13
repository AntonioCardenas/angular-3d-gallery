/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for angular-3d-gallery.
 *
 * This config is consumed by Angular's @angular/build:unit-test builder,
 * which merges these options with its internal Angular-aware Vite pipeline.
 *
 * Key design decisions (aligned with KI vitest-advanced-patterns):
 *   - Browser Mode via Playwright/chromium for real DOM, real Touch/matchMedia APIs.
 *   - unstubEnvs + mockReset prevent state bleeding between tests.
 *   - setupFiles wires our custom fixtures (Context API / Builder pattern).
 */
export default defineConfig({
  test: {
    globals: true,

    /* ── Browser Mode ─────────────────────────────────────────────── */
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
      ],
      headless: true,
    },

    /* ── Anti-state-bleeding guards ───────────────────────────────── */
    unstubEnvs: true,
    mockReset: true,
    restoreMocks: true,

    /* ── Fixtures & setup ─────────────────────────────────────────── */
    setupFiles: ['./src/test-setup/fixtures.ts'],

    /* ── File inclusion ───────────────────────────────────────────── */
    include: ['src/**/*.spec.ts'],
  },
});
