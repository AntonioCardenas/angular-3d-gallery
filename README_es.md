<p align="center">
  <img src="public/asset/angularjs.svg" alt="Angular Art Gallery Logo" width="120" />
</p>

<h1 align="center">Galería de Arte Angular</h1>

<p align="center">
  <strong>Experiencias 3D reactivas impulsadas por Angular 21 Signals y Three.js</strong>
</p>

<p align="center">
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/actions"><img src="https://img.shields.io/github/actions/workflow/status/AntonioCardenas/angular-3d-gallery/ci.yml?branch=main&style=flat-square" alt="Estado de Build" /></a>
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/blob/main/LICENSE"><img src="https://img.shields.io/github/license/AntonioCardenas/angular-3d-gallery?style=flat-square" alt="Licencia" /></a>
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/stargazers"><img src="https://img.shields.io/github/stars/AntonioCardenas/angular-3d-gallery?style=flat-square" alt="Estrellas" /></a>
  <a href="https://github.com/AntonioCardenas/angular-3d-gallery/issues"><img src="https://img.shields.io/github/issues/AntonioCardenas/angular-3d-gallery?style=flat-square" alt="Issues" /></a>
</p>

---

Una galería de arte en 3D inmersiva y de alto rendimiento construida con **Angular 21** y **Three.js**. Este proyecto demuestra el poder de **Angular3D**: un puente reactivo que une la estructura de Angular con la potencia de renderizado de Three.js.

## ¿Por qué este proyecto?

Construir experiencias 3D en la web suele significar elegir entre el rico ecosistema de Angular o la potencia de Three.js. Unirlos suele ser tedioso, implicando la gestión manual del ciclo de vida de los objetos y código imperativo que se siente extraño en un framework declarativo.

**Galería de Arte Angular** cierra esa brecha utilizando **Angular 21 Signals** como la única fuente de verdad para el estado de la escena 3D. Cuando una señal se actualiza —ya sea la posición de la cámara, la intensidad de la iluminación o las propiedades del material— solo las partes afectadas del grafo de la escena de Three.js reaccionan. Sin suscripciones manuales. Sin el desorden de `requestAnimationFrame`. Solo 3D puro y reactivo.

---

## Características

- **Renderizado de Próxima Generación**: Aprovechando WebGPU para gráficos de alto rendimiento y tasas de cuadros fluidas.
- **Grafo de Escena Impulsado por Señales**: Cada propiedad 3D está respaldada por Angular Signals para una reactividad de grano fino.
- **Iluminación Dinámica**: Sistema de iluminación personalizado con preajustes (Cinemático, Minimalista, Vibrante).
- **Audio Inmersivo**: Paisajes sonoros ambientales posicionales que reaccionan a tu movimiento y ajustes.
- **Controles Modernos**: Navegación fluida tanto para escritorio (Teclado/Ratón) como para móviles (Joysticks de Cristal).
- **Exhibiciones Interactivas**: Pantallas de arte de alta fidelidad con vistas detalladas en modales y metadatos.
- **Componentes Declarativos**: Define mallas, luces y cámaras como componentes de Angular usando la sintaxis de plantillas familiar.

---

## Inicio Rápido

Ejecuta la galería localmente en menos de un minuto:

```bash
# Clonar el repositorio
git clone https://github.com/AntonioCardenas/angular-3d-gallery.git
cd angular-3d-gallery

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
ng serve
```

Abre `http://localhost:4200` para explorar la galería.

---

## Guía de Desarrollo

### Requisitos Previos

| Herramienta | Versión |
| ----------- | ------- |
| Node.js     | ≥ 20    |
| Angular CLI | ≥ 21    |
| npm / Bun   | ≥ 10    |

### Estructura del Proyecto

```
src/
├── app/
│   ├── components/        # Componentes 3D reutilizables (Joysticks, Escena, Modal)
│   ├── pages/             # Páginas principales (Galería, Landing)
│   ├── services/          # Estado basado en Señales para Audio, Iluminación y Escena
│   └── app.ts             # Componente raíz de la aplicación
├── public/                # Archivos estáticos
│   ├── asset/             # Modelos, texturas e iconos
│   └── audio/             # Pistas de sonido ambiental
└── styles.css             # Estilos globales de la galería
```

### Creando tu primer componente 3D

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
  // Señales como única fuente de verdad
  cubeRotation = signal<[number, number, number]>([0, 0, 0]);
  cubeColor = signal('#ff6b35');

  // Estado derivado o efectos
  onCubeClick() {
    this.cubeColor.set('#' + Math.floor(Math.random()*16777215).toString(16));
  }
}
```

### Personalizando las Texturas del Entorno

Para cambiar la apariencia visual del suelo o del techo, puedes reemplazar los archivos de imagen (`floor.jpg`, `ceil.jpg`) en el directorio `public/asset/`.

Al mapear una imagen 2D sobre un plano 3D grande, la imagen se estirará para ajustarse a toda la geometría por defecto. Para evitar la distorsión y preservar la escala física de tu material (como azulejos o concreto), usamos la repetición de texturas de Three.js.

Aquí se muestra cómo se configura el suelo en `src/app/components/scene-graph/scene-graph.component.ts`:

```typescript
loader.load('/asset/floor.jpg', (t) => {
  // 1. Habilitar la repetición en ambos ejes: horizontal (S) y vertical (T)
  t.wrapS = t.wrapT = RepeatWrapping;
  
  // 2. Configurar cuántas veces se repite la textura a lo largo de la geometría
  // Ejemplo: '2' veces horizontalmente (ancho) y '1' vez verticalmente (profundidad)
  // ¡Ajusta estos valores en base a la relación de aspecto de tu nueva imagen y el tamaño de la sala!
  t.repeat.set(2, 1); 
  
  t.needsUpdate = true;
  this.floorTex.set(t);
});
```

---

## Hoja de Ruta

- [ ] Integración de física (Rapier)
- [ ] Línea de tiempo de animación integrada con keyframes de señales
- [ ] Sincronización multiusuario para recorridos compartidos
- [ ] Pipeline de post-procesamiento (bloom, SSAO)
- [ ] Soporte VR/AR vía WebXR
- [ ] Carga dinámica de exhibiciones de arte generadas por IA

---

## Contribuciones

Las contribuciones son las que hacen que la comunidad de código abierto sea increíble.

1. Haz un Fork del proyecto
2. Crea tu Rama de Característica (`git checkout -b feature/AmazingFeature`)
3. Haz un Commit de tus Cambios (`git commit -m 'Add some AmazingFeature'`)
4. Empuja a la Rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.

---

## Agradecimientos

- [Angular Three](https://angular-threejs.netlify.app/) — El puente entre Angular y Three.js.
- [Three.js](https://threejs.org) — El motor 3D que impulsa cada píxel.
- [Poimandres](https://github.com/pmndrs) — Por la suite de librerías de utilidad.

<p align="center">
  Creado con amor por <a href="https://github.com/AntonioCardenas">Antonio Cardenas</a>
</p>
