import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrackersComponent } from './my-trackers';

describe('MyTrackersComponent', () => {
  let component: MyTrackersComponent;
  let fixture: ComponentFixture<MyTrackersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTrackersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTrackersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
