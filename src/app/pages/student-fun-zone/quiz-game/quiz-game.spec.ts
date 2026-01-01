import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizGameComponent } from './quiz-game';

describe('QuizGameComponent', () => {
  let component: QuizGameComponent;
  let fixture: ComponentFixture<QuizGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizGameComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
