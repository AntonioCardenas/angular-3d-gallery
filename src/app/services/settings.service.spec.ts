import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() }
    });

    TestBed.configureTestingModule({});
  });

  it('should initialize with default values (false if not in localStorage)', () => {
    service = TestBed.inject(SettingsService);
    expect(service.useWebGPU()).toBe(false);
    expect(service.showFPS()).toBe(false);
  });

  it('should initialize from localStorage if present', () => {
    localStorage.setItem('useWebGPU', 'true');
    localStorage.setItem('showFPS', 'true');
    service = TestBed.inject(SettingsService);
    expect(service.useWebGPU()).toBe(true);
    expect(service.showFPS()).toBe(true);
  });

  it('should toggle showFPS and save to localStorage', () => {
    service = TestBed.inject(SettingsService);
    expect(service.showFPS()).toBe(false);
    
    service.toggleFPS();
    expect(service.showFPS()).toBe(true);
    expect(localStorage.getItem('showFPS')).toBe('true');

    service.toggleFPS();
    expect(service.showFPS()).toBe(false);
    expect(localStorage.getItem('showFPS')).toBe('false');
  });

  it('should toggle WebGPU, save to localStorage and reload window', () => {
    service = TestBed.inject(SettingsService);
    expect(service.useWebGPU()).toBe(false);
    
    service.toggleWebGPU();
    expect(service.useWebGPU()).toBe(true);
    expect(localStorage.getItem('useWebGPU')).toBe('true');
    expect(window.location.reload).toHaveBeenCalled();
  });
});
