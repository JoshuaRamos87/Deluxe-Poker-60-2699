import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcdScreenComponent } from './lcd-screen';

describe('LcdScreenComponent', () => {
  let component: LcdScreenComponent;
  let fixture: ComponentFixture<LcdScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LcdScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LcdScreenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
