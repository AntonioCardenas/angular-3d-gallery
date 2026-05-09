import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements AfterViewInit {
  constructor(
    private router: Router,
    private elRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    const elements = this.elRef.nativeElement.querySelectorAll('.animate');
    if (!elements.length) return;
    gsap.fromTo(
      elements,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, delay: 0.2, ease: 'power3.out' }
    );
  }

  enterGallery(): void {
    this.router.navigate(['/gallery']);
  }
}

