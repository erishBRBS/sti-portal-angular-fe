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
import { SubjectService } from '../../../../../services/admin-panel/curriculum-management/subject.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateSubjectPayload } from '../../../../../payloads/admin-panel/curriculum/subject/create-subject.payload';

@Component({
  selector: 'sti-subject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './subject-modal.component.html',
  styleUrl: './subject-modal.component.css',
})
export class SubjectModalComponent {

  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('subjectForm') subjectFormRef?: NgForm;

  private readonly subjectService = inject(SubjectService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  subject_code = '';
  subject_name = '';

  currentID = 0;
  pendingEditId: number | null = null;

  get dialogTitle(): string {
    return this.mode === ModalMode.ADD ? 'Add Subject' : 'Update Subject';
  }

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
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
      this.getSubjectById(id);
    });
  }

  onDialogShown(): void {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      this.getSubjectById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;
    this.subject_code = '';
    this.subject_name = '';

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  close() {
    this.submitted = false;
    this.subject_code = '';
    this.subject_name = '';
    this.visible = false;
  }

  onSave(form: NgForm) {
    if (form.invalid) {
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

  private submitAction(): void {

    const payload: CreateSubjectPayload = {
      subject_code: this.subject_code,
      subject_name: this.subject_name
    };

    this.subjectService.createSubject(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
      },
    });
  }

  private submitUpdateAction(): void {

    const payload: CreateSubjectPayload = {
      subject_code: this.subject_code,
      subject_name: this.subject_name
    };

    this.subjectService.updateSubject(this.currentID, payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
      },
    });
  }

  private getSubjectById(id: number): void {
    this.subjectService.getSubjectById(id).subscribe({
      next: (response) => {
        const data = response.data;
        this.subject_code = data.subject_code;
        this.subject_name = data.subject_name;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load subject.';
        this.toast.error('Error', msg);
      },
    });
  }
}