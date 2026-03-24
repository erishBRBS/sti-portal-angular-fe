import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog', () => {
    component.open({ title: 'Delete', message: 'Are you sure?' });

    expect(component.visible).toBe(true);
    expect(component.title).toBe('Delete');
  });

  it('should emit confirm', () => {
    const spy = vi.spyOn(component.onConfirm, 'emit');

    component.confirm();

    expect(spy).toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });

  it('should emit cancel', () => {
    const spy = vi.spyOn(component.onCancel, 'emit');

    component.close();

    expect(spy).toHaveBeenCalled();
    expect(component.visible).toBe(false);
  });
});