import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentManagementComponent } from './student.component';

describe('StudentComponent', () => {
  let component: StudentManagementComponent;
  let fixture: ComponentFixture<StudentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
