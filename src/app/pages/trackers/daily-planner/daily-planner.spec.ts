import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPlanner } from './daily-planner';

describe('DailyPlanner', () => {
  let component: DailyPlanner;
  let fixture: ComponentFixture<DailyPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyPlanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
