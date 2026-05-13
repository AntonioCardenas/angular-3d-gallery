import { render } from 'vitest-browser-angular';
import { test, expect, describe, vi } from '../../../test-setup/fixtures';
import { GlassJoystickComponent } from './glass-joystick.component';

/**
 * GlassJoystickComponent tests — Browser Mode (Playwright).
 *
 * Uses the extended `test` from our fixtures for consistency across the suite.
 * In Browser Mode, TouchEvent, Touch, getBoundingClientRect and
 * requestAnimationFrame are all REAL browser APIs — no mocking needed.
 *
 * DOM queries use `container.querySelector` since Vitest's Locator API
 * does not expose a public CSS-selector method.
 */
describe('GlassJoystickComponent (Browser Mode)', () => {
  test('should create', async () => {
    const { locator } = await render(GlassJoystickComponent, {
      inputs: { side: 'left' }
    });

    await expect.element(locator).toBeVisible();
  });

  test('should emit reset when touch ends', async () => {
    const { container, componentClassInstance } = await render(GlassJoystickComponent, {
      inputs: { side: 'left' }
    });

    const resetSpy = vi.spyOn(componentClassInstance.reset, 'emit');

    // Query the real DOM via container
    const baseElement = container.querySelector('.joystick-base') as HTMLElement;
    expect(baseElement).toBeTruthy();

    // In a real browser environment, TouchEvent exists naturally without dirty mocks
    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [new Touch({ identifier: 1, target: baseElement, clientX: 50, clientY: 50 })]
    });
    baseElement.dispatchEvent(touchStartEvent);

    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [new Touch({ identifier: 1, target: baseElement, clientX: 50, clientY: 50 })]
    });
    baseElement.dispatchEvent(touchEndEvent);

    expect(resetSpy).toHaveBeenCalled();
  });

  test('should emit moved on touch move via requestAnimationFrame', async () => {
    const { container, componentClassInstance } = await render(GlassJoystickComponent, {
      inputs: { side: 'left' }
    });

    const movedSpy = vi.spyOn(componentClassInstance.moved, 'emit');
    const baseElement = container.querySelector('.joystick-base') as HTMLElement;
    expect(baseElement).toBeTruthy();

    // The browser natively handles getBoundingClientRect() now. No mock needed!
    const rect = baseElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const touchStartEvent = new TouchEvent('touchstart', {
      changedTouches: [new Touch({ identifier: 1, target: baseElement, clientX: centerX, clientY: centerY })]
    });
    baseElement.dispatchEvent(touchStartEvent);

    // Move 25px down and right
    const touchMoveEvent = new TouchEvent('touchmove', {
      cancelable: true,
      touches: [new Touch({ identifier: 1, target: baseElement, clientX: centerX + 25, clientY: centerY + 25 })]
    });
    baseElement.dispatchEvent(touchMoveEvent);

    // Wait for the next animation frame
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(movedSpy).toHaveBeenCalled();
    const emitted = movedSpy.mock.calls[0][0];

    // Values are calculated natively based on real CSS rendering.
    // nx and ny should be proportional to the movement relative to the base radius.
    expect(emitted.nx).toBeGreaterThan(0);
    expect(emitted.ny).toBeGreaterThan(0);
  });
});
