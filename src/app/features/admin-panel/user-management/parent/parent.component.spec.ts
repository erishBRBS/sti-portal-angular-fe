import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentManagementComponent } from './parent.component';

describe('ParentComponent', () => {
  let component: ParentManagementComponent;
  let fixture: ComponentFixture<ParentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
