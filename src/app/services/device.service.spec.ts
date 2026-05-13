import { TestBed } from '@angular/core/testing';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let matchMediaMock: any;
  let originalTouchPoints: number;

  beforeEach(() => {
    // Guardar original
    originalTouchPoints = navigator.maxTouchPoints;

    // Crear mock de matchMedia
    matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock
    });

    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    // Restaurar original
    Object.defineProperty(navigator, 'maxTouchPoints', { value: originalTouchPoints, writable: true });
  });

  it('should detect mobile when maxTouchPoints is > 0', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 1, writable: true });
    
    const service = TestBed.inject(DeviceService);
    expect(service.isMobile()).toBe(true);
  });

  it('should detect mobile when matchMedia pointer is coarse', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, writable: true });
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)',
    }));

    const service = TestBed.inject(DeviceService);
    expect(service.isMobile()).toBe(true);
  });

  it('should detect desktop when no touch points and fine pointer', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, writable: true });
    
    const service = TestBed.inject(DeviceService);
    expect(service.isMobile()).toBe(false);
  });
});
