import { Injectable, computed, signal } from '@angular/core';

export interface LightPreset {
  id: string;
  name: string;
  dotColor: string;
  ambientColor: string;
  ambientIntensity: number;
  dirColor: string;
  dirIntensity: number;
  fogHex: number;
  fogDensity: number;
}

export const LIGHT_PRESETS: LightPreset[] = [
  { id: 'gallery',   name: 'Gallery',   dotColor: '#e8e8e8', ambientColor: '#ffffff', ambientIntensity: 1.5,  dirColor: '#f8f0e0', dirIntensity: 0.8,  fogHex: 0x666666, fogDensity: 0.025 },
  { id: 'warm',      name: 'Warm',      dotColor: '#ffb347', ambientColor: '#ffd080', ambientIntensity: 1.3,  dirColor: '#ff9944', dirIntensity: 0.7,  fogHex: 0x7a5033, fogDensity: 0.028 },
  { id: 'rave',      name: 'Rave',      dotColor: '#ff00ff', ambientColor: '#ff00ff', ambientIntensity: 2.2,  dirColor: '#00ffff', dirIntensity: 1.5,  fogHex: 0x150025, fogDensity: 0.035 },
  { id: 'red',       name: 'Red',       dotColor: '#ff4444', ambientColor: '#ff1a1a', ambientIntensity: 1.5,  dirColor: '#cc0000', dirIntensity: 0.9,  fogHex: 0x330000, fogDensity: 0.030 },
  { id: 'blue',      name: 'Corporate', dotColor: '#4488ff', ambientColor: '#4488ff', ambientIntensity: 1.4,  dirColor: '#aaddff', dirIntensity: 1.0,  fogHex: 0x001133, fogDensity: 0.025 },
  { id: 'violet',    name: 'Violet',    dotColor: '#cc44ff', ambientColor: '#9933ff', ambientIntensity: 1.3,  dirColor: '#cc88ff', dirIntensity: 0.8,  fogHex: 0x1a0033, fogDensity: 0.030 },
  { id: 'night',     name: 'Night',     dotColor: '#6677ff', ambientColor: '#1a1a3e', ambientIntensity: 0.5,  dirColor: '#7788ff', dirIntensity: 0.25, fogHex: 0x050510, fogDensity: 0.050 },
];

@Injectable({ providedIn: 'root' })
export class LightingService {
  readonly presets = LIGHT_PRESETS;

  private _activeId = signal<string>(localStorage.getItem('lightPreset') ?? 'gallery');
  readonly activeId = this._activeId.asReadonly();

  readonly current = computed(() => this.presets.find(p => p.id === this._activeId()) ?? this.presets[0]);
  readonly ambientColor     = computed(() => this.current().ambientColor);
  readonly ambientIntensity = computed(() => this.current().ambientIntensity);
  readonly dirColor         = computed(() => this.current().dirColor);
  readonly dirIntensity     = computed(() => this.current().dirIntensity);
  readonly isRave           = computed(() => this._activeId() === 'rave');

  setPreset(id: string): void {
    this._activeId.set(id);
    localStorage.setItem('lightPreset', id);
  }
}
