import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { GlassJoystickComponent } from '../glass-joystick/glass-joystick.component';
import { InputService } from '../../services/input.service';

@Component({
  selector: 'app-look-joystick',
  standalone: true,
  imports: [GlassJoystickComponent],
  template: `
    <app-glass-joystick
      side="right"
      (moved)="onMove($event.nx, $event.ny)"
      (reset)="onReset()"
    />
  `,
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookJoystickComponent {
  private input = inject(InputService);

  onMove(nx: number, ny: number): void {
    this.input.setLook(nx, ny);
  }

  onReset(): void {
    this.input.setLook(0, 0);
  }
}
