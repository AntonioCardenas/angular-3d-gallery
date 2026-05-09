import {
  Component,
  inject,
  ChangeDetectionStrategy,
  DOCUMENT,
  effect,
} from '@angular/core';
import { NgtCanvas } from 'angular-three/dom';
import { NgtsStats } from 'angular-three-soba/stats';
import { SceneGraphComponent } from '../scene-graph/scene-graph.component';
import { DeviceService } from '../../services/device.service';
import { SettingsService } from '../../services/settings.service';
import { WebGPURenderer } from 'three/webgpu';

@Component({
  selector: 'app-scene',
  standalone: true,
  imports: [NgtCanvas, SceneGraphComponent, NgtsStats],
  template: `
    <ngt-canvas
      [camera]="{ fov: 50, position: [0, 1.75, 0] }"
      [shadows]="true"
      [gl]="settings.useWebGPU() ? webgpuGl : undefined"
      [stats]="{ domClass: 'ngt-stats-panel' }"
      class="scene-canvas"
    >
      <ng-template canvasContent>
        <app-scene-graph />
      </ng-template>
    </ngt-canvas>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .scene-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneComponent {
  protected device = inject(DeviceService);
  protected settings = inject(SettingsService);
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      this.document.body.classList.toggle('fps-hidden', !this.settings.showFPS());
    });
  }

  protected webgpuGl = (options: any) => {
    const renderer = new WebGPURenderer({ canvas: options.canvas, antialias: true });
    let isInitialized = false;

    renderer.init().then(() => {
      isInitialized = true;
      this.settings.webGPUActive.set(true);
    }).catch((err: unknown) => {
      console.error('WebGPU Init Error:', err);
      this.settings.webGPUActive.set(false);
    });

    const originalRender = renderer.render.bind(renderer);
    renderer.render = (scene: any, camera: any) => {
      if (isInitialized) {
        originalRender(scene, camera);
      }
    };

    return renderer;
  };
}
