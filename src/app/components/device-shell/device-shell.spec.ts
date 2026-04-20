import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceShellComponent } from './device-shell';

describe('DeviceShellComponent', () => {
  let component: DeviceShellComponent;
  let fixture: ComponentFixture<DeviceShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
