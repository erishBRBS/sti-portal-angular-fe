import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdminModalComponent } from './view-admin-modal.component';

describe('ViewAdminModalComponent', () => {
  let component: ViewAdminModalComponent;
  let fixture: ComponentFixture<ViewAdminModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAdminModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAdminModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
