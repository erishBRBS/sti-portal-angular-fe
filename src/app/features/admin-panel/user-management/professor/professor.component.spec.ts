import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorManagementComponent } from './professor.component';

describe('ProfessorComponent', () => {
  let component: ProfessorManagementComponent;
  let fixture: ComponentFixture<ProfessorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessorManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessorManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
