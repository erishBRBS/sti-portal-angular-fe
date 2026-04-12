import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableImagesComponent } from './data-table-images.component';

describe('DataTableImagesComponent', () => {
  let component: DataTableImagesComponent;
  let fixture: ComponentFixture<DataTableImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableImagesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
