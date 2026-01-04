import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterTrackerComponent } from './water-tracker';

describe('WaterTrackerComponent', () => {
  let component: WaterTrackerComponent;
  let fixture: ComponentFixture<WaterTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterTrackerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
