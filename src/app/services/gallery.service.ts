import { Injectable, signal } from '@angular/core';

export interface ArtworkData {
  id: number;
  title: string;
  releaseDate?: string;
  description: string;
  features?: string[];
  imageUrl: string;
  comingSoon?: boolean;
  docsUrl: string;
  videoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  selectedArtwork = signal<ArtworkData | null>(null);

  setSelectedArtwork(artwork: ArtworkData | null): void {
    this.selectedArtwork.set(artwork);
  }
}
