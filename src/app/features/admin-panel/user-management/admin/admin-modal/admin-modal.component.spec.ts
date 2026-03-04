import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModalComponent } from './admin-modal.component';

describe('AdminModalComponent', () => {
  let component: AdminModalComponent;
  let fixture: ComponentFixture<AdminModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
