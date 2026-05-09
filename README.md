<p align="center">
  <img src="public/asset/angularjs.svg" alt="Angular Art Gallery Logo" width="120" />
</p>

<h1 align="center">Angular Art Gallery</h1>

<p align="center">
  <strong>Reactive 3D experiences powered by Angular 21 Signals and Three.js</strong>
</p>

<p align="center">
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/actions"><img src="https://img.shields.io/github/actions/workflow/status/AntonioCardenas/angular-3d-gallery/ci.yml?branch=main&style=flat-square" alt="Build Status" /></a>
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/blob/main/LICENSE"><img src="https://img.shields.io/github/license/AntonioCardenas/angular-3d-gallery?style=flat-square" alt="License" /></a>
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/stargazers"><img src="https://img.shields.io/github/stars/AntonioCardenas/angular-3d-gallery?style=flat-square" alt="Stars" /></a>
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/issues"><img src="https://img.shields.io/github/issues/AntonioCardenas/angular-3d-gallery?style=flat-square" alt="Issues" /></a>
</p>

---

An immersive, high-performance 3D art gallery built with **Angular 21** and **Three.js**. This project demonstrates the power of **Angular3D**—a reactive bridge that brings the structure of Angular together with the raw rendering power of Three.js.

## Why This Project?

Building 3D experiences on the web usually means choosing between the rich ecosystem of Angular or the power of Three.js. Gluing them together is often painful, involving manual object lifecycle management and imperative code that feels alien in a declarative framework.

**Angular Art Gallery** bridges that gap using **Angular 21 Signals** as the single source of truth for the 3D scene state. When a signal updates—whether it's camera position, lighting intensity, or material properties—only the affected parts of the Three.js scene graph react. No manual subscriptions. No `requestAnimationFrame` spaghetti. Just pure, reactive 3D.

---

## Features

- **Next-Gen Rendering**: Leveraging WebGPU for high-performance graphics and smooth frame rates.
- **Signal-Driven Scene Graph**: Every 3D property is backed by Angular Signals for fine-grained reactivity.
- **Dynamic Lighting**: Custom-built lighting system with presets (Cinematic, Minimalist, Vibrant).
- **Immersive Audio**: Positional ambient soundscapes that react to your movement and presets.
- **Modern Controls**: Seamless navigation for both desktop (Keyboard/Mouse) and mobile (Glass Joysticks).
- **Interactive Exhibits**: High-fidelity art displays with detailed modal views and metadata.
- **Declarative Components**: Define meshes, lights, and cameras as Angular components using familiar template syntax.

---

## Quick Start

Get the gallery running locally in under a minute:

```bash
# Clone the repository
git clone https://github.com/AntonioCardenas/angular-3d-gallery.git
cd angular-3d-gallery

# Install dependencies
npm install

# Start the dev server
ng serve
```

Open `http://localhost:4200` to explore the gallery.

---

## Development Guide

### Prerequisites

| Tool        | Version |
| ----------- | ------- |
| Node.js     | ≥ 20    |
| Angular CLI | ≥ 21    |
| npm / Bun   | ≥ 10    |

### Project Structure

```
src/
├── app/
│   ├── components/        # Reusable 3D components (Joysticks, Scene, Modal)
│   ├── pages/             # Main application pages (Gallery, Landing)
│   ├── services/          # Signal-based state for Audio, Lighting, and Scene
│   └── app.ts             # Root application component
├── public/                # Static assets
│   ├── asset/             # Models, textures, and site icons
│   └── audio/             # Ambient sound tracks
└── styles.css             # Global gallery styling
```

### Creating Your First 3D Component

```typescript
import { Component, signal, computed } from '@angular/core';
import { NgtCanvas } from 'angular-three';

@Component({
  selector: 'app-cube-scene',
  standalone: true,
  template: `
    <ngt-canvas [sceneGraph]="scene" />
  `
})
export class CubeSceneComponent {
  // Signals as the single source of truth
  cubeRotation = signal<[number, number, number]>([0, 0, 0]);
  cubeColor = signal('#ff6b35');

  // Derived state or effects
  onCubeClick() {
    this.cubeColor.set('#' + Math.floor(Math.random()*16777215).toString(16));
  }
}
```

### Customizing Environment Textures

To change the visual appearance of the floor or ceiling, you can replace the image files (`floor.jpg`, `ceil.jpg`) in the `public/asset/` directory.

When mapping a 2D image onto a large 3D plane, the image will stretch to fit the entire geometry by default. To prevent distortion and preserve the physical scale of your material (like tiles or concrete), we use Three.js texture repeating.

Here is how the floor is configured in `src/app/components/scene-graph/scene-graph.component.ts`:

```typescript
loader.load('/asset/floor.jpg', (t) => {
  // 1. Enable repeating on both the horizontal (S) and vertical (T) axes
  t.wrapS = t.wrapT = RepeatWrapping;
  
  // 2. Set how many times the texture repeats across the geometry
  // Example: '2' times horizontally (width) and '1' time vertically (depth)
  // Tweak these values based on the aspect ratio of your new image and the room size!
  t.repeat.set(2, 1); 
  
  t.needsUpdate = true;
  this.floorTex.set(t);
});
```

---

## Roadmap

- [ ] Physics integration (Rapier)
- [ ] Built-in animation timeline with signal keyframes
- [ ] Multi-user synchronization for shared gallery tours
- [ ] Post-processing pipeline (bloom, SSAO)
- [ ] VR/AR support via WebXR
- [ ] AI-generated art exhibit dynamic loading

---

## Contributing

Contributions are what make the open-source community great. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgments

- [Angular Three](https://angular-threejs.netlify.app/) — The bridge between Angular and Three.js.
- [Three.js](https://threejs.org) — The 3D engine powering every pixel.
- [Poimandres](https://github.com/pmndrs) — For the suite of utility libraries.

<p align="center">
  Built with love by <a href="https://github.com/AntonioCardenas">Antonio Cardenas</a> and <a href="https://github.com/google-deepmind">Antigravity</a>
</p>
