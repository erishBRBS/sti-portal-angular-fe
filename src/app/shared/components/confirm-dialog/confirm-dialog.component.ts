import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sti-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {

  visible = false;

  title = 'Confirm';
  message = 'Are you sure?';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  open(options: { title?: string; message?: string }) {
    this.title = options.title || 'Confirm';
    this.message = options.message || 'Are you sure?';
    this.visible = true;
  }

  confirm() {
    this.onConfirm.emit();
    this.visible = false;
  }

  close() {
    this.onCancel.emit();
    this.visible = false;
  }
}