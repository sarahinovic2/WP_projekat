import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StudentFunZone } from './student-fun-zone';

describe('StudentFunZone', () => {
  let component: StudentFunZone;
  let fixture: ComponentFixture<StudentFunZone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFunZone, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFunZone);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
