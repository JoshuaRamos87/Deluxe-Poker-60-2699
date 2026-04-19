import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceShell } from './device-shell';

describe('DeviceShell', () => {
  let component: DeviceShell;
  let fixture: ComponentFixture<DeviceShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceShell],
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
