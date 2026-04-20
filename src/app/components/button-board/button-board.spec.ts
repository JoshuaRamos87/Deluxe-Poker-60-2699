import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBoardComponent } from './button-board';

describe('ButtonBoardComponent', () => {
  let component: ButtonBoardComponent;
  let fixture: ComponentFixture<ButtonBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonBoardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
