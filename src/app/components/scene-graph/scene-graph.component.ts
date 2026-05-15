import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { extend, beforeRender } from 'angular-three';
import { NgtsPointerLockControls } from 'angular-three-soba/controls';
import {
  BoxGeometry,
  Euler,
  FogExp2,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
  Vector3,
  Group,
} from 'three';
// Light classes must share the same module instance as WebGPURenderer's StandardNodeLibrary
// so the WeakMap lookup in LightsNode.setupNodeLights finds the right node class.
import { AmbientLight, DirectionalLight } from 'three/webgpu';
import { GalleryService } from '../../services/gallery.service';
import { InputService } from '../../services/input.service';
import { DeviceService } from '../../services/device.service';
import { AudioService } from '../../services/audio.service';
import { LightingService } from '../../services/lighting.service';
import { LoadingService } from '../../services/loading.service';
import { NgtArgs } from 'angular-three';

extend({
  AmbientLight,
  BoxGeometry,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
  Vector3,
  DirectionalLight,
});

const MOVE_SPEED = 38.0;
const DRAG = 10.0;
const GRAVITY = 9.8 * 7.0;
const STAND_HEIGHT = 1.75;
const PRONE_HEIGHT = 0.85;
const JUMP_VELOCITY = 11.0;
const PRONE_SPEED_MULT = 0.5;
const HEIGHT_LERP_RATE = 12.0;

const YAW_SPEED = 2.2;
const PITCH_SPEED = 1.6;
const MAX_PITCH = Math.PI * 0.255; // ~46° up/down from level

// PointerLockControls uses polar angle (0 = up, π/2 = level, π = down)
const MIN_POLAR = Math.PI / 2 - MAX_PITCH; // max look-up
const MAX_POLAR = Math.PI / 2 + MAX_PITCH; // max look-down

const ANGULAR_VERSIONS = [
  // ── Row 1: north wall, facing south (index 0-9) ──────────────────────────
  { version: '2',  name: 'Angular 2',   released: 'Sep 2016', description: 'The complete rewrite of AngularJS — TypeScript-first from day one, component-based architecture, dependency injection, and a powerful CLI.',                                   features: ['Component-based architecture', 'TypeScript native support', 'Ahead-of-Time compilation', 'Angular CLI'] },
  { version: '4',  name: 'Angular 4',   released: 'Mar 2017', description: 'Skipped v3 to align router package versions. Delivered smaller & faster bundles, ngIf with else blocks, and a separated animations module.',                                   features: ['Smaller bundle sizes', 'ngIf with else', 'Animations module split', 'TypeScript 2.1+'] },
  { version: '5',  name: 'Angular 5',   released: 'Nov 2017', description: 'Focused on speed, size and simplicity. Introduced HttpClient as a modern replacement for Http and improved the compiler pipeline significantly.',                              features: ['HttpClient API', 'Build optimizer', 'Progressive Web Apps', 'Compiler improvements'] },
  { version: '6',  name: 'Angular 6',   released: 'May 2018', description: 'Unified the framework under one version. Introduced Angular Elements for custom elements, ng add & ng update CLI commands, and the Angular Material CDK.',                     features: ['Angular Elements', 'ng add / ng update', 'Angular Material CDK', 'Ivy renderer preview'] },
  { version: '7',  name: 'Angular 7',   released: 'Oct 2018', description: 'A landmark CDK release. Virtual Scrolling and Drag & Drop arrived, CLI prompts improved DX, and bundle budgets warned against size regressions.',                             features: ['Virtual scrolling', 'Drag & Drop CDK', 'CLI prompts', 'Bundle budgets'] },
  { version: '8',  name: 'Angular 8',   released: 'May 2019', description: 'Differential loading shipped by default — modern ES2015+ to capable browsers, legacy bundles to older ones. Ivy landed as an opt-in preview.',                                 features: ['Differential loading', 'Dynamic lazy routes', 'Ivy opt-in preview', 'Web Workers support'] },
  { version: '9',  name: 'Angular 9',   released: 'Feb 2020', description: 'Ivy became the default renderer. Smaller bundle sizes, faster test compilation, improved type checking, and better error messages across the board.',                           features: ['Ivy default renderer', 'Smaller bundles', 'Improved type checking', 'TypeScript 3.7'] },
  { version: '10', name: 'Angular 10',  released: 'Jun 2020', description: 'A quality-focused release: optional strict project setup, warnings for CommonJS imports, Material date range picker, and TypeScript 3.9 support.',                             features: ['Optional strict mode', 'Date range picker', 'CommonJS import warnings', 'TypeScript 3.9'] },
  { version: '11', name: 'Angular 11',  released: 'Nov 2020', description: 'Hot Module Replacement, component test harnesses for every Angular Material component, automatic font inlining, and stricter types throughout.',                                features: ['Hot Module Replacement', 'Component test harnesses', 'Automatic font inlining', 'TypeScript 4.0'] },
  { version: '12', name: 'Angular 12',  released: 'May 2021', description: 'Strict mode became the default for new projects. Nullish coalescing in templates, Webpack 5, and the first step toward Ivy-only with View Engine deprecated.',                  features: ['Strict mode default', 'Nullish coalescing', 'Webpack 5', 'View Engine deprecated'] },
  // ── Row 2: south wall, facing north (index 10-19) ────────────────────────
  { version: '13', name: 'Angular 13',  released: 'Nov 2021', description: 'View Engine removed entirely. Persistent build cache cut rebuild times dramatically. Components no longer need NgModule declarations.',                                         features: ['View Engine removed', 'Persistent build cache', 'RxJS 7.4', 'API surface clean-up'] },
  { version: '14', name: 'Angular 14',  released: 'Jun 2022', description: 'Standalone components — bootstrapping without NgModule. Typed reactive forms finally brought compile-time safety to form controls.',                                            features: ['Standalone components', 'Typed reactive forms', 'Streamlined page title', 'CLI standalone support'] },
  { version: '15', name: 'Angular 15',  released: 'Nov 2022', description: 'Standalone APIs graduated to stable. NgOptimizedImage, the directive composition API, and functional router guards simplified common patterns drastically.',                   features: ['Standalone APIs stable', 'NgOptimizedImage', 'Directive composition API', 'Functional router guards'] },
  { version: '16', name: 'Angular 16',  released: 'May 2023', description: 'Signals arrived as a developer preview — a new fine-grained reactive primitive. Required inputs, self-closing tags, and esbuild builder landed.',                              features: ['Signals (developer preview)', 'Required inputs', 'esbuild builder default', 'Hydration improvements'] },
  { version: '17', name: 'Angular 17',  released: 'Nov 2023', description: 'Built-in @if, @for and @switch control flow replaced structural directives. @defer enabled lazy-loading blocks declaratively. angular.dev launched.',                          features: ['Built-in control flow', '@defer deferred loading', 'New docs at angular.dev', 'View Transitions API'] },
  { version: '18', name: 'Angular 18',  released: 'May 2024', description: 'Experimental zoneless change detection began replacing Zone.js. Angular Material 3 and full application hydration reached stable.',                                           features: ['Zoneless change detection', 'Material 3 stable', 'Full app hydration', 'Route redirects as functions'] },
  { version: '19', name: 'Angular 19',  released: 'Nov 2024', description: 'Standalone became the default. Incremental hydration, per-route render-mode control, and linked signals brought the new reactivity story to completion.',                      features: ['Standalone by default', 'Incremental hydration', 'Route-level render mode', 'Linked signals'] },
  { version: '20', name: 'Angular 20',  released: 'May 2025', description: 'Signals, Effects and the Resource API reached stable. Vitest integration arrived for unit testing. Zoneless support matured further.',                                          features: ['Signals & Effects stable', 'Resource API stable', 'Vitest integration', 'Improved zoneless'] },
  { version: '21', name: 'Angular 21',  released: 'Nov 2025', description: 'Continued refinements to the signals ecosystem with enhanced DevTools, improved SSR pipeline, and better tree-shaking for leaner production bundles.',                         features: ['Enhanced signal DevTools', 'Improved SSR pipeline', 'Better tree-shaking', 'Performance gains'] },
  { version: '22', name: 'Angular 22',  released: 'Coming Soon', description: 'The next major chapter in Angular\'s evolution — stay tuned for announcements from the Angular team at angular.dev.',                                                        features: ['Next-gen reactivity', 'Improved DX', 'Performance', 'New capabilities'], comingSoon: true },
] as const;

const PAINTING_COUNT = ANGULAR_VERSIONS.length; // 20
const HALF = PAINTING_COUNT / 2;                 // 10 per wall
const SPACING = 3.2;                             // 2 units wide + 1.2 gap
const SPREAD = SPACING * (HALF - 1) / 2;         // 14.4 — centres each row

@Component({
  selector: 'app-scene-graph',
  standalone: true,
  imports: [NgtsPointerLockControls, NgtArgs],
  templateUrl: './scene-graph.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SceneGraphComponent {
  protected gallery = inject(GalleryService);
  protected input = inject(InputService);
  protected device = inject(DeviceService);
  private audio = inject(AudioService);
  protected lighting = inject(LightingService);

  protected readonly plcOptions = { minPolarAngle: MIN_POLAR, maxPolarAngle: MAX_POLAR };

  // Loaded textures
  protected floorTex = signal<any>(null);
  protected wallTex = signal<any>(null);
  protected ceilTex = signal<any>(null);
  protected paintingTextures = signal<any[]>([]);
  // Hover state for each painting
  protected hoveredId = signal<number | null>(null);

  // Programmatic canvas textures for side walls
  protected readonly leftWallTex: CanvasTexture = this.buildGraffitiTexture();
  protected readonly rightWallTex: CanvasTexture = this.buildCreditsTexture();
  private readonly weaveTileCanvas: HTMLCanvasElement = this.buildWeaveTile();

  // Angular version showcase paintings — 10 per wall, centred
  protected paintings = ANGULAR_VERSIONS.map((v, i) => ({
    id: i,
    src: `/images/ng${v.version}.jpg`,
    title: v.name,
    releaseDate: v.released,
    description: v.description,
    features: [...v.features],
    comingSoon: (v as any).comingSoon ?? false,
    docsUrl: (v as any).comingSoon
      ? 'https://next.angular.dev/overview'
      : +v.version >= 21
        ? 'https://angular.dev/'
        : +v.version >= 18
          ? `https://v${v.version}.angular.dev/overview`
          : `https://v${v.version}.angular.io/`,
    isBottomRow: i < HALF,
    position: (i < HALF
      ? [SPACING * i - SPREAD, 2.6, -2.96]
      : [SPACING * (HALF - 1 - (i - HALF)) - SPREAD, 2.6, 2.96]) as [number, number, number],
    rotation: (i < HALF
      ? [0, 0, 0]
      : [0, Math.PI, 0]) as [number, number, number],
  }));

  // Player physics state
  private velocity = new Vector3();
  private keyState = {
    forward: false, backward: false, left: false, right: false,
    jump: false, prone: false,
  };
  private euler = new Euler(0, 0, 0, 'YXZ');
  private cameraInitialized = false;
  private currentEyeHeight = STAND_HEIGHT;

  // Scratch variables for physics
  private _forward = new Vector3();
  private _right = new Vector3();
  private elapsedTime = 0;

  protected readonly Math = Math;

  private loading = inject(LoadingService);
  private texturesLoaded = 0;
  private readonly TOTAL_TEXTURES = 3 + PAINTING_COUNT;

  private onTextureLoaded(): void {
    if (++this.texturesLoaded === this.TOTAL_TEXTURES) {
      this.loading.isLoaded.set(true);
    }
  }

  constructor() {
    const loader = new TextureLoader();

    // Load environment textures
    loader.load('/asset/floor.jpg', (t) => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(3, 1);
      t.needsUpdate = true;
      this.floorTex.set(t);
      this.onTextureLoaded();
    });

    loader.load('/asset/wall.jpg', (t) => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(1, 1);
      t.needsUpdate = true;
      this.wallTex.set(t);
      this.onTextureLoaded();
    });

    loader.load('/asset/ceil.jpg', (t) => {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(3, 1);
      t.needsUpdate = true;
      this.ceilTex.set(t);
      this.onTextureLoaded();
    });

    // Load painting textures — fall back to placeholder if version image is missing
    const texArr: any[] = new Array(PAINTING_COUNT).fill(null);
    let loaded = 0;
    const onLoad = (t: any, i: number) => {
      texArr[i] = this.applyWeave(t.image);
      if (++loaded === PAINTING_COUNT) this.paintingTextures.set([...texArr]);
      this.onTextureLoaded();
    };
    this.paintings.forEach((p, i) => {
      loader.load(
        p.src,
        (t) => onLoad(t, i),
        undefined,
        () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext('2d')!;
          
          const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
          grad.addColorStop(0, '#dd0031');
          grad.addColorStop(1, '#a60024');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 1024);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 320px "Inter", "Roboto", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const text = p.title.replace('Angular ', 'ng');
          ctx.fillText(text, 512, 512);
          
          const t = new CanvasTexture(canvas);
          onLoad(t, i);
        }
      );
    });

    // Keyboard controls
    const keyMap: Record<string, keyof typeof this.keyState> = {
      KeyW: 'forward', ArrowUp: 'forward',
      KeyS: 'backward', ArrowDown: 'backward',
      KeyA: 'left', ArrowLeft: 'left',
      KeyD: 'right', ArrowRight: 'right',
    };

    document.addEventListener('keydown', (e) => {
      const k = keyMap[e.code];
      if (k) this.keyState[k] = true;
      if (e.code === 'Space') { this.keyState.jump = true; e.preventDefault(); }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') {
        this.keyState.prone = true;
      }
    });
    document.addEventListener('keyup', (e) => {
      const k = keyMap[e.code];
      if (k) this.keyState[k] = false;
      if (e.code === 'Space') this.keyState.jump = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') {
        this.keyState.prone = false;
      }
    });

    // Render loop — player movement + touch look
    beforeRender(({ camera, delta, scene }) => {
      this.elapsedTime += delta;

      // Ensure fog exists, then sync color/density to active preset every frame
      if (!scene.fog) scene.fog = new FogExp2(0x666666, 0.025);
      const preset = this.lighting.current();
      if (scene.fog instanceof FogExp2) {
        scene.fog.density = preset.fogDensity;
        if (this.lighting.isRave()) {
          const hue = (this.elapsedTime * 0.12) % 1;
          scene.fog.color.setHSL((hue + 0.66) % 1, 0.8, 0.14);
        } else {
          scene.fog.color.setHex(preset.fogHex);
        }
      }
      
      if (!this.cameraInitialized) {
        this.cameraInitialized = true;
        this.euler.set(0, Math.PI / 2, 0);
        camera.quaternion.setFromEuler(this.euler);
      }

      // Touch-look (mobile)
      const lx = this.input.lookX();
      const ly = this.input.lookY();
      if (lx !== 0 || ly !== 0) {
        this.euler.setFromQuaternion(camera.quaternion, 'YXZ');
        this.euler.y -= lx * YAW_SPEED * delta;
        this.euler.x -= ly * PITCH_SPEED * delta;
        camera.quaternion.setFromEuler(this.euler);
      }

      // Clamp pitch for ALL input methods (mobile joystick + desktop PointerLockControls).
      // PointerLockControls updates the camera quaternion on mouse events outside this loop,
      // so we clamp here every frame to catch both.
      this.euler.setFromQuaternion(camera.quaternion, 'YXZ');
      if (Math.abs(this.euler.x) > MAX_PITCH) {
        this.euler.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.euler.x));
        camera.quaternion.setFromEuler(this.euler);
      }

      // Physics
      this.velocity.x -= this.velocity.x * DRAG * delta;
      this.velocity.z -= this.velocity.z * DRAG * delta;
      this.velocity.y -= GRAVITY * delta;

      const fwd = this.keyState.forward || this.input.forward();
      const bwd = this.keyState.backward || this.input.backward();
      const lft = this.keyState.left || this.input.left();
      const rgt = this.keyState.right || this.input.right();
      const jmp = this.keyState.jump || this.input.jump();
      const prone = this.keyState.prone || this.input.prone();

      const targetEyeHeight = prone ? PRONE_HEIGHT : STAND_HEIGHT;
      this.currentEyeHeight += (targetEyeHeight - this.currentEyeHeight) * (1 - Math.exp(-HEIGHT_LERP_RATE * delta));

      const grounded = camera.position.y <= this.currentEyeHeight + 0.01 && this.velocity.y <= 0;
      if (jmp && grounded && !prone) {
        this.velocity.y = JUMP_VELOCITY;
      }

      const speedMul = prone ? PRONE_SPEED_MULT : 1.0;
      if (fwd) this.velocity.z -= MOVE_SPEED * speedMul * delta;
      if (bwd) this.velocity.z += MOVE_SPEED * speedMul * delta;
      if (lft) this.velocity.x -= MOVE_SPEED * speedMul * delta;
      if (rgt) this.velocity.x += MOVE_SPEED * speedMul * delta;

      const moving = (fwd || bwd || lft || rgt) &&
        (Math.abs(this.velocity.x) + Math.abs(this.velocity.z)) > 0.3;
      if (moving && grounded) this.audio.playStep();

      this._forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
      this._forward.y = 0;
      this._forward.normalize();

      this._right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      this._right.y = 0;
      this._right.normalize();

      camera.position.addScaledVector(this._right, this.velocity.x * delta);
      camera.position.addScaledVector(this._forward, -this.velocity.z * delta);
      camera.position.y += this.velocity.y * delta;

      if (camera.position.y < this.currentEyeHeight) {
        this.velocity.y = 0;
        camera.position.y = this.currentEyeHeight;
      }

      // Bounds
      if (camera.position.z < -2) camera.position.z = -2;
      if (camera.position.z > 2) camera.position.z = 2;
      if (camera.position.x < -18) camera.position.x = -18;
      if (camera.position.x > 18) camera.position.x = 18;
    });
  }

  onLock(): void {
    console.log('Pointer Locked - UI should hide');
    this.input.setLocked(true);
  }

  onUnlock(): void {
    console.log('Pointer Unlocked - UI should show');
    this.input.setLocked(false);
  }

  getPaintingWidth(tex: any): number {
    const w = tex?.image?.width ?? 1150;
    return (w / 1150) * 2;
  }

  getPaintingHeight(tex: any): number {
    const h = tex?.image?.height ?? 1150;
    return (h / 1150) * 2;
  }

  onPaintingClick(e: any, p: typeof this.paintings[0], index: number): void {
    e.stopPropagation?.();
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation?.();
      e.nativeEvent.stopPropagation?.();
    }
    document.exitPointerLock();
    this.gallery.setSelectedArtwork({
      id: index,
      title: p.title,
      releaseDate: p.releaseDate,
      description: p.description,
      features: p.features,
      imageUrl: p.src,
      comingSoon: p.comingSoon,
      docsUrl: p.docsUrl,
    });
  }

  private drawAngularShield(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, size: number,
    color: string, opacity: number,
  ): void {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(cx, cy);
    const r = size / 2;

    // Shield silhouette
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.72, -r * 0.44);
    ctx.lineTo(r * 0.72, r * 0.28);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.72, r * 0.28);
    ctx.lineTo(-r * 0.72, -r * 0.44);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.045;
    ctx.stroke();

    // "A" inside
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.floor(size * 0.55)}px Impact, "Arial Black", sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText('A', 0, r * 0.07);

    ctx.restore();
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private buildWeaveTile(): HTMLCanvasElement {
    const S = 64;
    const canvas = document.createElement('canvas');
    canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(S, S);
    const data = imageData.data;
    const THREADS = 16;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const u = (x / S) * THREADS;
        const v = (y / S) * THREADS;
        const col = Math.floor(u);
        const row = Math.floor(v);
        const warpOnTop = (col + row) % 2 === 0;
        const warp = Math.sin((u - col) * Math.PI);
        const weft = Math.sin((v - row) * Math.PI);
        const brightness = 0.78 + (warpOnTop ? warp : weft) * 0.22;
        const idx = (y * S + x) * 4;
        data[idx]     = Math.round(brightness * 255);
        data[idx + 1] = Math.round(brightness * 248);
        data[idx + 2] = Math.round(brightness * 230);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  private applyWeave(source: HTMLImageElement | HTMLCanvasElement): CanvasTexture {
    const W = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth || source.width;
    const H = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight || source.height;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(source, 0, 0, W, H);
    const pattern = ctx.createPattern(this.weaveTileCanvas, 'repeat')!;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  private buildGraffitiTexture(): CanvasTexture {
    const S = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, S, S);
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;

    Promise.all([
      document.fonts.load('300 16px Roboto').catch(() => {}),
      document.fonts.load('400 16px Roboto').catch(() => {}),
      this.loadImage('/asset/angularjs.svg').catch(() => null),
    ]).then(([,, img]) => {
      this.drawGraffitiDesign(ctx, S, img as HTMLImageElement | null);
      tex.needsUpdate = true;
    });

    return tex;
  }

  private drawGraffitiDesign(ctx: CanvasRenderingContext2D, S: number, img: HTMLImageElement | null): void {
    const R = 'Roboto, Arial, sans-serif';

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, S, S);

    // Collection label
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 17px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText('HERITAGE COLLECTION', S / 2, S * 0.11);
    ctx.restore();

    // AngularJS wordmark (SVG ratio: 695 × 185)
    const svgW = Math.round(S * 0.74);
    const svgH = Math.round(svgW * 185 / 695);
    const svgX = (S - svgW) / 2;
    const svgY = S * 0.19;
    if (img) {
      ctx.drawImage(img, svgX, svgY, svgW, svgH);
    } else {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `300 56px ${R}`;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillText('AngularJS', S / 2, svgY + svgH / 2);
      ctx.restore();
    }

    const afterSvg = svgY + svgH;

    // Thin rule
    const ruleY = afterSvg + S * 0.07;
    ctx.save();
    const rg = ctx.createLinearGradient((S - 180) / 2, 0, (S + 180) / 2, 0);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(0.5, 'rgba(0,0,0,0.12)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = rg;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((S - 180) / 2, ruleY);
    ctx.lineTo((S + 180) / 2, ruleY);
    ctx.stroke();
    ctx.restore();

    // Subtitle
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 24px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText('JavaScript MVC Framework', S / 2, ruleY + S * 0.065);
    ctx.restore();

    // Date
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 19px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText('2010  ·  2022', S / 2, ruleY + S * 0.065 + S * 0.045);
    ctx.restore();

    // Curator paragraph
    const cuStartY = ruleY + S * 0.055 + S * 0.04 + S * 0.075;
    const cuLH = S * 0.032;
    const cuLines = [
      'The framework that pioneered structured web development',
      'through two-way data binding, dependency injection,',
      'and component-based architecture.',
    ];
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 20px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    cuLines.forEach((line, i) => ctx.fillText(line, S / 2, cuStartY + i * cuLH));
    ctx.restore();

    // Footer URL
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 17px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('angularjs.org', S / 2, S * 0.93);
    ctx.restore();
  }

  private buildCreditsTexture(): CanvasTexture {
    const S = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, S, S);
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;

    const FALLBACK_CONTRIBUTORS = ['antonioCardenas', 'ᐸʸᵉᵒᵘᵈᵉᵛ/ᐳ'];

    Promise.all([
      document.fonts.load('300 16px Roboto').catch(() => {}),
      document.fonts.load('400 16px Roboto').catch(() => {}),
      fetch('https://api.github.com/repos/AntonioCardenas/angular-3d-gallery/contributors')
        .then(r => r.json())
        .then((data: { login: string }[]) => data.map(c => c.login))
        .catch(() => FALLBACK_CONTRIBUTORS),
      this.loadImage('/asset/logo.png').catch(() => null),
    ]).then(([,, contributors, gifImg]) => {
      this.drawCreditsDesign(ctx, S, (contributors as string[]), gifImg as HTMLImageElement | null);
      tex.needsUpdate = true;
    });

    return tex;
  }

  private drawCreditsDesign(ctx: CanvasRenderingContext2D, S: number, contributors: string[], img: HTMLImageElement | null): void {
    const R = 'Roboto, Arial, sans-serif';

    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, S, S);

    // Collection label
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 17px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillText('ANGULAR HERITAGE GALLERY', S / 2, S * 0.11);
    ctx.restore();

    // Angular logo
    if (img) {
      const logoSize = S * 0.22;
      ctx.drawImage(img, (S - logoSize) / 2, S * 0.17, logoSize, logoSize);
    }
    
    // Thin rule
    const ruleY = S * 0.40;
    ctx.save();
    const rg = ctx.createLinearGradient((S - 180) / 2, 0, (S + 180) / 2, 0);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(0.5, 'rgba(0,0,0,0.12)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = rg;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((S - 180) / 2, ruleY);
    ctx.lineTo((S + 180) / 2, ruleY);
    ctx.stroke();
    ctx.restore();


    // "Angular Community" heading
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 27px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText('Made with love by Angular Community', S / 2, ruleY + S * 0.065);
    ctx.restore();

    // Contributors label
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 17px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillText('CONTRIBUTORS', S / 2, ruleY + S * 0.12);
    ctx.restore();

    // Contributors 4-column grid
    const COLS = 4;
    const colW = (S * 0.82) / COLS;
    const gridLeft = S * 0.09;
    const rowH = S * 0.052;
    const listStartY = ruleY + S * 0.18;
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `300 18px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    contributors.forEach((name, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      ctx.fillText(name, gridLeft + (col + 0.5) * colW, listStartY + row * rowH);
    });
    ctx.restore();

    // Second rule — sits below however many rows the grid needed
    const gridRows = Math.ceil(contributors.length / COLS);
    const rule2Y = listStartY + gridRows * rowH + S * 0.02;
    ctx.save();
    const rg2 = ctx.createLinearGradient((S - 120) / 2, 0, (S + 120) / 2, 0);
    rg2.addColorStop(0, 'rgba(0,0,0,0)');
    rg2.addColorStop(0.5, 'rgba(0,0,0,0.08)');
    rg2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.strokeStyle = rg2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((S - 120) / 2, rule2Y);
    ctx.lineTo((S + 120) / 2, rule2Y);
    ctx.stroke();
    ctx.restore();


    // Year
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `300 17px ${R}`;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('2026', S / 2, rule2Y + S * 0.055 + S * 0.04);
    ctx.restore();
  }
}
