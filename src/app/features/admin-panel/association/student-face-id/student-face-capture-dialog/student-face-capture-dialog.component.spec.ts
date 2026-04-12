import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFaceCaptureDialogComponent } from './student-face-capture-dialog.component';

describe('StudentFaceCaptureDialogComponent', () => {
  let component: StudentFaceCaptureDialogComponent;
  let fixture: ComponentFixture<StudentFaceCaptureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFaceCaptureDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFaceCaptureDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
