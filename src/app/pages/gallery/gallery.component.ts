import {
  Component,
  inject,
  signal,
  effect,
  ElementRef,
  viewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { SceneComponent } from '../../components/scene/scene.component';
import { GalleryModalComponent } from '../../components/gallery-modal/gallery-modal.component';
import { MobileControlsComponent } from '../../components/mobile-controls/mobile-controls.component';
import { LookJoystickComponent } from '../../components/look-joystick/look-joystick.component';
import { InputService } from '../../services/input.service';
import { DeviceService } from '../../services/device.service';
import { SettingsService } from '../../services/settings.service';
import { AudioService } from '../../services/audio.service';
import { LightingService } from '../../services/lighting.service';
import { LoadingService } from '../../services/loading.service';
import gsap from 'gsap';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [
    SceneComponent,
    GalleryModalComponent,
    MobileControlsComponent,
    LookJoystickComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent implements AfterViewInit {
  protected device = inject(DeviceService);
  protected input = inject(InputService);
  protected settings = inject(SettingsService);
  protected audio = inject(AudioService);
  protected lighting = inject(LightingService);
  protected isMobile = this.device.isMobile;
  private router = inject(Router);

  protected loading = inject(LoadingService);
  private instructionsRef = viewChild<ElementRef<HTMLDivElement>>('instructions');
  private preloaderRef = viewChild<ElementRef<HTMLDivElement>>('preloader');
  protected mobileStarted = signal(false);
  protected preloaderHidden = signal(false);

  constructor() {
    effect(() => {
      if (this.loading.isLoaded()) {
        const el = this.preloaderRef()?.nativeElement;
        if (el) {
          gsap.to(el, { opacity: 0, duration: 0.7, ease: 'power2.in', onComplete: () => this.preloaderHidden.set(true) });
        } else {
          this.preloaderHidden.set(true);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const el = this.instructionsRef()?.nativeElement;
    if (el) {
      gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, delay: 0.3, ease: 'power3.out' });
    }
  }

  handleFirstTouch(): void {
    if (this.mobileStarted()) return;
    this.mobileStarted.set(true);
    this.audio.resume();
    this.audio.startAmbient();
  }

  startExplore(): void {
    this.mobileStarted.set(true);
    this.audio.resume();
    this.audio.startAmbient();
    if (!this.isMobile()) {
      const canvas = document.querySelector('canvas');
      canvas?.requestPointerLock();
    }
  }

  onVolumeChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.audio.setVolume(Number(val));
  }

  exitGallery(): void {
    document.exitPointerLock();
    this.router.navigate(['/']);
  }
}
