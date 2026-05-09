import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./pages/gallery/gallery.component').then(m => m.GalleryComponent),
  },
  { path: '**', redirectTo: '' },
];
