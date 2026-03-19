import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ModalMode } from '../../../../../enums/modal.mode';
import { SectionService } from '../../../../../services/admin-panel/curriculum-management/section.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateSectionPayload } from '../../../../../payloads/admin-panel/curriculum/section/create-section.payload';

@Component({
  selector: 'sti-section-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './section-modal.component.html',
  styleUrl: './section-modal.component.css',
})
export class SectionModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('sectionForm') sectionFormRef?: NgForm;

  private readonly sectionService = inject(SectionService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  // template-driven fields
  section_name = '';
  currentID = 0;
  pendingEditId: number | null = null;

get dialogTitle(): string {

  if (this.mode === ModalMode.ADD) return 'Add Section';

  if (this.mode === ModalMode.UPDATE) return 'Update Section';

  return 'View Section';

}

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
  }
  
viewDialog(id: number): void {

  this.mode = ModalMode.VIEW;
  this.currentID = id;
  this.visible = true;

  this.resetForm(true);

  setTimeout(() => {
    this.getSectionById(id);
  });

}
  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = 0;
    this.visible = true;
    this.resetForm();
  }

  updateDialog(id: number): void {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);

    setTimeout(() => {
      this.getSectionById(id);
    });
  }

onDialogShown() {
  if (this.mode === ModalMode.UPDATE && this.pendingEditId) {

    const id = this.pendingEditId;

    setTimeout(() => {
      this.getSectionById(id);
    }, 0);

    this.pendingEditId = null;
  }
}

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;
    this.section_name = '';

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  // MARK: - Button Function
  close() {
    this.submitted = false;
    this.section_name = '';
    this.visible = false;
  }

  onSave(form: NgForm) {
    if (form.invalid) {
      console.log('form invalid');
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }

    if (this.mode === ModalMode.ADD) {
      this.submitAction();
    } else {
      this.submitUpdateAction();
    }
  }

  // MARK: - API Function
  private submitAction(): void {
    const payload: CreateSectionPayload = {
      section_name: this.section_name,
    };

    this.sectionService.createSection(payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(msg);
      },
    });
  }

  private submitUpdateAction(): void {
    const payload: CreateSectionPayload = {
      section_name: this.section_name,
    };

    this.sectionService.updateSection(this.currentID, payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(msg);
      },
    });
  }

  private getSectionById(id: number): void {
    this.sectionService.getSectionById(id).subscribe({
      next: (response) => {
        const data = response.data;
        this.section_name = data.section_name;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load section details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }
}