import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlassJoystickComponent } from './glass-joystick.component';
import { ComponentRef } from '@angular/core';

describe('GlassJoystickComponent', () => {
  let component: GlassJoystickComponent;
  let fixture: ComponentFixture<GlassJoystickComponent>;
  let componentRef: ComponentRef<GlassJoystickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlassJoystickComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GlassJoystickComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    // Set required input
    componentRef.setInput('side', 'left');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit reset when doReset is called via touch end', () => {
    const resetSpy = vi.spyOn(component.reset, 'emit');
    
    // Mock touch event without `new Touch()` for JSDOM compatibility
    const touchStartEvent = new TouchEvent('touchstart');
    Object.defineProperty(touchStartEvent, 'changedTouches', {
        value: [{ identifier: 1, target: fixture.nativeElement }]
    });
    component.onTouchStart(touchStartEvent);

    const touchEndEvent = new TouchEvent('touchend');
    Object.defineProperty(touchEndEvent, 'changedTouches', {
        value: [{ identifier: 1, target: fixture.nativeElement }]
    });
    component.onTouchEnd(touchEndEvent);

    expect(resetSpy).toHaveBeenCalled();
  });

  it('should emit moved on touch move via requestAnimationFrame', async () => {
    const movedSpy = vi.spyOn(component.moved, 'emit');
    
    // We mock getBoundingClientRect
    const baseElement = fixture.nativeElement.querySelector('.joystick-base');
    if (baseElement) {
        vi.spyOn(baseElement, 'getBoundingClientRect').mockReturnValue({
            left: 0, top: 0, width: 100, height: 100
        } as any);
    }

    const createTouch = (id: number, x: number, y: number) => ({
      identifier: id,
      target: fixture.nativeElement,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y
    });

    // Touch start
    const touchStartEvent: any = new Event('touchstart');
    touchStartEvent.changedTouches = [createTouch(1, 50, 50)];
    component.onTouchStart(touchStartEvent);

    // Touch move (moving right and down)
    const touchMoveEvent: any = new Event('touchmove', { cancelable: true });
    touchMoveEvent.touches = [createTouch(1, 75, 75)];
    
    component.onTouchMove(touchMoveEvent);

    // RequestAnimationFrame needs to run
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(movedSpy).toHaveBeenCalled();
    // 75 is 25px away from center (50). Radius is 100 * 0.45 = 45. nx = 25/45 = 0.555
    const emitted = movedSpy.mock.calls[0][0];
    expect(emitted.nx).toBeCloseTo(0.555, 2);
    expect(emitted.ny).toBeCloseTo(0.555, 2);
  });
});
