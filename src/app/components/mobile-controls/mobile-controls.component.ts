import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { GlassJoystickComponent } from '../glass-joystick/glass-joystick.component';
import { InputService } from '../../services/input.service';

const THRESHOLD = 0.25;

@Component({
  selector: 'app-mobile-controls',
  standalone: true,
  imports: [GlassJoystickComponent],
  template: `
    <app-glass-joystick
      side="left"
      (moved)="onMove($event.nx, $event.ny)"
      (reset)="onReset()"
    />

    <div class="action-buttons">
      <button
        type="button"
        class="action-btn jump-btn"
        aria-label="Jump"
        (touchstart)="onJumpDown($event)"
        (touchend)="onJumpUp($event)"
        (touchcancel)="onJumpUp($event)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l-5 6h3v4h4V9h3l-5-6zm-7 16h14v2H5v-2z" fill="currentColor"/>
        </svg>
      </button>

      <button
        type="button"
        class="action-btn prone-btn"
        [class.active]="prone()"
        aria-label="Prone"
        aria-pressed="false"
        [attr.aria-pressed]="prone()"
        (touchstart)="onProneToggle($event)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21l-5-6h3v-4h4v4h3l-5 6zM5 3h14v2H5V3z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .action-buttons {
      position: absolute;
      right: clamp(1.25rem, 4vmin, 2.5rem);
      bottom: calc(clamp(1.25rem, 4vmin, 2.5rem) + clamp(5rem, 20vmin, 9rem) + 0.75rem);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      z-index: 51;
      user-select: none;
      touch-action: none;
    }

    .action-btn {
      width: clamp(3rem, 11vmin, 4.25rem);
      height: clamp(3rem, 11vmin, 4.25rem);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      touch-action: none;
      transition: transform 0.08s ease-out, background 0.18s, border-color 0.18s, color 0.18s;
    }

    .action-btn:active {
      transform: scale(0.92);
      background: rgba(255, 255, 255, 0.18);
    }

    .action-btn.active {
      background: rgba(0, 255, 128, 0.18);
      border-color: rgba(0, 255, 128, 0.55);
      color: #00ff80;
    }

    .action-btn svg {
      width: 55%;
      height: 55%;
      pointer-events: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileControlsComponent {
  private input = inject(InputService);
  protected prone = signal(false);

  onMove(nx: number, ny: number): void {
    this.input.setForward(ny < -THRESHOLD);
    this.input.setBackward(ny > THRESHOLD);
    this.input.setLeft(nx < -THRESHOLD);
    this.input.setRight(nx > THRESHOLD);
  }

  onReset(): void {
    this.input.setForward(false);
    this.input.setBackward(false);
    this.input.setLeft(false);
    this.input.setRight(false);
  }

  onJumpDown(e: TouchEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.input.setJump(true);
  }

  onJumpUp(e: TouchEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.input.setJump(false);
  }

  onProneToggle(e: TouchEvent): void {
    e.preventDefault();
    e.stopPropagation();
    const next = !this.prone();
    this.prone.set(next);
    this.input.setProne(next);
  }
}
