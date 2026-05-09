import {
  Component,
  inject,
  signal,
  effect,
  ElementRef,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { GalleryService } from '../../services/gallery.service';
import gsap from 'gsap';

@Component({
  selector: 'app-gallery-modal',
  standalone: true,
  imports: [],
  templateUrl: './gallery-modal.component.html',
  styleUrl: './gallery-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryModalComponent {
  protected gallery = inject(GalleryService);
  protected hdOpen = signal(false);

  private containerRef = viewChild<ElementRef<HTMLDivElement>>('container');

  constructor() {
    // Animate in whenever a new artwork is selected
    effect(() => {
      const artwork = this.gallery.selectedArtwork();
      if (artwork) {
        // Wait for next tick so the element is rendered
        setTimeout(() => {
          const el = this.containerRef()?.nativeElement;
          if (el) {
            gsap.fromTo(
              el,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
            );
          }
        }, 0);
      }
    });
  }

  protected close(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    console.log('Closing artwork modal...');
    this.gallery.setSelectedArtwork(null);
    this.hdOpen.set(false);
  }

  protected openHd(): void {
    this.hdOpen.set(true);
  }

  protected closeHd(): void {
    this.hdOpen.set(false);
  }

  protected stopPropagation(e: Event): void {
    e.stopPropagation();
  }
}
