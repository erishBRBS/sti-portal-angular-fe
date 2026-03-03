import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManagementComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: AdminManagementComponent;
  let fixture: ComponentFixture<AdminManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
