import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardComponent } from './whiteboard';

describe('WhiteboardComponent', () => {
  let component: WhiteboardComponent;
  let fixture: ComponentFixture<WhiteboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhiteboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhiteboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
