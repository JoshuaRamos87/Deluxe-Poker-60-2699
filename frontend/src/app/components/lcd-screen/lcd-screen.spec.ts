import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcdScreen } from './lcd-screen';

describe('LcdScreen', () => {
  let component: LcdScreen;
  let fixture: ComponentFixture<LcdScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LcdScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(LcdScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
