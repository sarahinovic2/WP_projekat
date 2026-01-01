import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieTrackerComponent } from './movie-tracker';

describe('MovieTrackerComponent', () => {
  let component: MovieTrackerComponent;
  let fixture: ComponentFixture<MovieTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieTrackerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
