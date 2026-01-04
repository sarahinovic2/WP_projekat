import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceTracker } from './finance-tracker';

describe('FinanceTracker', () => {
  let component: FinanceTracker;
  let fixture: ComponentFixture<FinanceTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
