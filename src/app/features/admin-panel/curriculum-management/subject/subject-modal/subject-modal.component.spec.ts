import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectModalComponent } from './subject-modal.component';

describe('SubjectModalComponent', () => {
  let component: SubjectModalComponent;
  let fixture: ComponentFixture<SubjectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
