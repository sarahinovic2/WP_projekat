import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MyTrackersComponent } from './my-trackers';

describe('MyTrackersComponent', () => {
  let component: MyTrackersComponent;
  let fixture: ComponentFixture<MyTrackersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTrackersComponent, RouterTestingModule]
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
