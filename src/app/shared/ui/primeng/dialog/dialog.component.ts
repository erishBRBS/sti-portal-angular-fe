import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, AvatarModule],
  templateUrl: './dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // UI
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() description?: string;
  @Input() avatarUrl?: string;

  // PrimeNG options
  @Input() width = '28rem';
  @Input() modal = true;
  @Input() closable = true;
  @Input() dismissableMask = true;
  @Input() draggable = false;
  @Input() resizable = false;

  // style
  @Input() styleClass =
    'rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800';

  // footer defaults
  @Input() showDefaultFooter = true;
  @Input() cancelLabel = 'Cancel';
  @Input() confirmLabel = 'Save';
  @Input() closeOnCancel = true;
  @Input() closeOnConfirm = false;

  // form states
  @Input() confirmDisabled = false;
  @Input() loading = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  setVisible(v: boolean) {
    this.visibleChange.emit(v);
  }

  onCancel() {
    this.cancel.emit();
    if (this.closeOnCancel) this.setVisible(false);
  }

  onConfirm() {
    this.confirm.emit();
    if (this.closeOnConfirm) this.setVisible(false);
  }

  get hasHeader() {
    return !!this.title || !!this.subtitle || !!this.avatarUrl;
  }
}