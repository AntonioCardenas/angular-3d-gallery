import { Injectable, signal, effect, inject } from '@angular/core';
import { LightingService } from './lighting.service';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private lighting = inject(LightingService);

  stepSoundEnabled = signal(localStorage.getItem('stepSound') === 'true');
  ambientMusicEnabled = signal(localStorage.getItem('ambientMusic') === 'true');
  volume = signal<number>(Number(localStorage.getItem('musicVolume') ?? '22'));

  private ctx: AudioContext | null = null;
  private ambientEl: HTMLAudioElement | null = null;
  private lastStepMs = 0;

  // Map presets to audio files
  private readonly musicMap: Record<string, string> = {
    gallery: '/audio/classic.mp3',
    warm: '/audio/warm.mp3',
    rave: '/audio/ambient.mp3',
    red: '/audio/rave.mp3',
    blue: '/audio/blue.mp3',
    violet: '/audio/violet.mp3',
    night: '/audio/night.mp3',
  };

  constructor() {
    // Automatically switch music when light preset changes
    effect(() => {
      const activeId = this.lighting.activeId();
      this.updateMusicForPreset(activeId);
    });
  }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  /** Call once on first user gesture so AudioContext is allowed to run. */
  resume(): void {
    this.ctx?.resume();
    if (this.ambientMusicEnabled()) this.startAmbient();
  }

  playStep(): void {
    if (!this.stepSoundEnabled()) return;
    const now = Date.now();
    if (now - this.lastStepMs < 380) return;
    this.lastStepMs = now;
    this.triggerStep();
  }

  private triggerStep(): void {
    try {
      const ctx = this.getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;

      // Low thump — heel hitting hard floor
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);
      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);

      // Short noise transient — sole contact
      const bufSize = Math.floor(ctx.sampleRate * 0.045);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) ch[i] = Math.random() * 2 - 1;
      const noiseSrc = ctx.createBufferSource();
      const hp = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      hp.type = 'highpass';
      hp.frequency.value = 1200;
      noiseGain.gain.setValueAtTime(0.18, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      noiseSrc.buffer = buf;
      noiseSrc.connect(hp);
      hp.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSrc.start(t);
    } catch (_) { /* AudioContext unavailable */ }
  }

  private updateMusicForPreset(id: string): void {
    const src = this.musicMap[id] || this.musicMap['gallery'];
    if (!this.ambientEl) {
      this.ambientEl = new Audio(src);
      this.ambientEl.loop = true;
      this.ambientEl.volume = 0; // Start at 0 for fade-in
    } else {
      // Fade out, change source, fade in
      this.fadeMusic(0, 500, () => {
        if (this.ambientEl) {
          this.ambientEl.src = src;
          if (this.ambientMusicEnabled()) {
            this.ambientEl.play().then(() => this.fadeMusic(this.volume() / 100, 1000)).catch(() => {});
          }
        }
      });
      return;
    }

    if (this.ambientMusicEnabled()) {
      this.startAmbient();
    }
  }

  private fadeMusic(targetVolume: number, durationMs: number, onComplete?: () => void): void {
    if (!this.ambientEl) return;
    const startVolume = this.ambientEl.volume;
    const diff = targetVolume - startVolume;
    const steps = 20;
    const stepTime = durationMs / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (this.ambientEl) {
        this.ambientEl.volume = startVolume + (diff * (currentStep / steps));
      }
      if (currentStep >= steps) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  startAmbient(): void {
    if (!this.ambientEl) {
      const activeId = this.lighting.activeId();
      this.updateMusicForPreset(activeId);
      return;
    }
    if (this.ambientMusicEnabled()) {
      this.ambientEl.play().then(() => this.fadeMusic(this.volume() / 100, 1000)).catch(() => {});
    }
  }

  stopAmbient(): void {
    this.fadeMusic(0, 500, () => this.ambientEl?.pause());
  }

  toggleStepSound(): void {
    this.stepSoundEnabled.update(v => !v);
    localStorage.setItem('stepSound', String(this.stepSoundEnabled()));
  }

  setVolume(val: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    this.volume.set(clamped);
    localStorage.setItem('musicVolume', String(clamped));
    if (this.ambientEl) this.ambientEl.volume = clamped / 100;
  }

  toggleAmbientMusic(): void {
    this.ambientMusicEnabled.update(v => !v);
    localStorage.setItem('ambientMusic', String(this.ambientMusicEnabled()));
    if (this.ambientMusicEnabled()) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }
}

