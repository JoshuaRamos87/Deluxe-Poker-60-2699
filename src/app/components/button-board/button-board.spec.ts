import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBoard } from './button-board';

describe('ButtonBoard', () => {
  let component: ButtonBoard;
  let fixture: ComponentFixture<ButtonBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
