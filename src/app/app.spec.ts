import { render } from 'vitest-browser-angular';
import { test, expect, describe } from '../test-setup/fixtures';
import { App } from './app';

/**
 * App root component tests — Browser Mode (Playwright).
 *
 * Migrated from TestBed-only pattern to `render` (vitest-browser-angular).
 * Uses extended `test` from our fixtures for consistent Angular environment.
 *
 * Since App uses RouterOutlet, we render it `withRouting: true` which
 * creates a wildcard route and navigates to `/`.
 */
describe('App', () => {
  test('should create the app', async () => {
    const { fixture } = await render(App, {
      withRouting: true,
    });

    expect(fixture.componentInstance).toBeTruthy();
  });

  test('should render a router-outlet in the DOM', async () => {
    const { container } = await render(App, {
      withRouting: true,
    });

    // In real browser mode, verify the component rendered its template
    const routerOutlet = container.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});
