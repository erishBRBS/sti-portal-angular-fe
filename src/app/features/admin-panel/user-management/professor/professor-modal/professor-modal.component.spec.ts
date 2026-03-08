import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorModalComponent } from './professor-modal.component';

describe('ProfessorModalComponent', () => {
  let component: ProfessorModalComponent;
  let fixture: ComponentFixture<ProfessorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessorModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
