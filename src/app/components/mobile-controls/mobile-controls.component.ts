import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
  `,
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileControlsComponent {
  private input = inject(InputService);

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
}
