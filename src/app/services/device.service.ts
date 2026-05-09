import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  isMobile = signal<boolean | null>(null);

  constructor() {
    const check = () => {
      this.isMobile.set(
        window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
      );
    };

    check();
    window.addEventListener('resize', check);
  }
}
