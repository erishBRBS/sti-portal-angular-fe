import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionModalComponent } from './section-modal.component';

describe('SectionModalComponent', () => {
  let component: SectionModalComponent;
  let fixture: ComponentFixture<SectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
