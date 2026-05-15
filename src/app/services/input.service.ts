import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InputService {
  // Movement signals
  forward = signal(false);
  backward = signal(false);
  left = signal(false);
  right = signal(false);
  jump = signal(false);
  prone = signal(false);

  // Look signals (for touch controls)
  lookX = signal(0);
  lookY = signal(0);

  // Desktop pointer lock state
  isLocked = signal(false);

  setLocked(locked: boolean): void {
    if (this.isLocked() !== locked) this.isLocked.set(locked);
  }

  setForward(active: boolean): void {
    if (this.forward() !== active) this.forward.set(active);
  }

  setBackward(active: boolean): void {
    if (this.backward() !== active) this.backward.set(active);
  }

  setLeft(active: boolean): void {
    if (this.left() !== active) this.left.set(active);
  }

  setRight(active: boolean): void {
    if (this.right() !== active) this.right.set(active);
  }

  setJump(active: boolean): void {
    if (this.jump() !== active) this.jump.set(active);
  }

  setProne(active: boolean): void {
    if (this.prone() !== active) this.prone.set(active);
  }

  setLook(x: number, y: number): void {
    if (this.lookX() !== x || this.lookY() !== y) {
      this.lookX.set(x);
      this.lookY.set(y);
    }
  }
}
