import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  useWebGPU = signal(localStorage.getItem('useWebGPU') === 'true');
  showFPS = signal(localStorage.getItem('showFPS') === 'true');

  /** Set to true by SceneComponent once WebGPURenderer.init() resolves */
  webGPUActive = signal(false);
  /** True if the browser exposes navigator.gpu (WebGPU API exists) */
  readonly webGPUSupported = signal(typeof navigator !== 'undefined' && 'gpu' in navigator);

  toggleWebGPU(): void {
    this.useWebGPU.update(v => !v);
    localStorage.setItem('useWebGPU', String(this.useWebGPU()));
    // NgtCanvas doesn't hot-swap renderers — reload so the new GL factory takes effect.
    this.reloadPage();
  }

  toggleFPS(): void {
    this.showFPS.update(v => !v);
    localStorage.setItem('showFPS', String(this.showFPS()));
  }

  /** Isolated for testability — window.location.reload is non-configurable in real browsers */
  protected reloadPage(): void {
    window.location.reload();
  }
}
