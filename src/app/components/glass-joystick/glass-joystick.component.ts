import {
  Component,
  input,
  output,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';


@Component({
  selector: 'app-glass-joystick',
  standalone: true,
  imports: [],
  templateUrl: './glass-joystick.component.html',
  styleUrl: './glass-joystick.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlassJoystickComponent implements OnDestroy {
  side = input.required<'left' | 'right'>();
  moved = output<{ nx: number; ny: number }>();
  reset = output<void>();

  private knobRef = viewChild<ElementRef<HTMLDivElement>>('knob');
  private baseRef = viewChild<ElementRef<HTMLDivElement>>('base');
  private touchId: number | null = null;
  private rafId: number | null = null;
  private pendingNx = 0;
  private pendingNy = 0;

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private moveKnob(kx: number, ky: number, snap: boolean): void {
    const el = this.knobRef()?.nativeElement;
    if (!el) return;
    el.style.transition = snap
      ? 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'none';
    el.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
  }

  private doReset(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.reset.emit();
    this.moveKnob(0, 0, true);
    this.touchId = null;
  }

  onTouchStart(e: TouchEvent): void {
    e.stopPropagation();
    if (this.touchId !== null) return;
    this.touchId = e.changedTouches[0].identifier;
  }

  onTouchMove(e: TouchEvent): void {
    e.stopPropagation();
    e.preventDefault();
    if (this.touchId === null) return;
    const base = this.baseRef()?.nativeElement;
    if (!base) return;

    let touch: Touch | null = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === this.touchId) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch) return;

    const rect = base.getBoundingClientRect();
    const radius = rect.width * 0.45;
    const dx = touch.clientX - (rect.left + rect.width / 2);
    const dy = touch.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const scale = dist > radius ? radius / dist : 1;
    const cx = dx * scale;
    const cy = dy * scale;

    // Knob visual updates immediately for responsiveness
    this.moveKnob(cx, cy, false);

    // Emit through RAF so signals update at most once per frame
    this.pendingNx = cx / radius;
    this.pendingNy = cy / radius;
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.moved.emit({ nx: this.pendingNx, ny: this.pendingNy });
      });
    }
  }

  onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.doReset();
        break;
      }
    }
  }
}
