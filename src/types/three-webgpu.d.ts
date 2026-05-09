// Type shim for three/webgpu — re-exports all of three plus WebGPU-specific additions.
// The runtime module resolves to node_modules/three/src/Three.WebGPU.js via tsconfig paths.
declare module 'three/webgpu' {
  export * from 'three';

  export class WebGPURenderer {
    isWebGPURenderer: true;
    library: {
      addLight(nodeClass: unknown, lightClass: unknown): void;
      getLightNodeClass(lightClass: unknown): unknown;
    };
    init(): Promise<void>;
    render(scene: import('three').Scene, camera: import('three').Camera): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(value: number): void;
    dispose(): void;
    constructor(parameters?: {
      canvas?: HTMLCanvasElement;
      antialias?: boolean;
      alpha?: boolean;
      forceWebGL?: boolean;
      [key: string]: unknown;
    });
  }
}
