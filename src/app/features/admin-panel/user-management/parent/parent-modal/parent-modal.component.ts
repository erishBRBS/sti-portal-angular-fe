import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { CreateParentPayload } from '../../../../../payloads/admin-panel/user-management/parent/create-parent.payload';
import { ModalMode } from '../../../../../enums/modal.mode';
import { ParentService } from '../../../../../services/admin-panel/user-management/parent/parent.service';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'sti-parent-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './parent-modal.component.html',
  styleUrl: './parent-modal.component.css',
})
export class ParentModalComponent {
  @Output() onSuccess = new EventEmitter<void>();

  @ViewChild('parentForm') parentFormRef?: NgForm;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  private parentService = inject(ParentService);
  
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  // form fields
  full_name = '';
  email = '';
  mobile_number = '';
  username = '';
  password = '';

  showPassword = false;

  
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileName = '';

  currentID: number | null = null;
  pendingEditId: number | null = null;

  get dialogTitle(): string {
    return this.mode === ModalMode.ADD ? 'Add Parent' : 'Update Parent';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) event.preventDefault();
  }

  // =========================
  // MODAL CONTROL
  // =========================

  showDialog() {
    this.mode = ModalMode.ADD;
    this.currentID = null;
    this.visible = true;
    this.resetForm();
  }

  updateDialog(id: number) {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);
  }

  onDialogShown() {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      this.getParentById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  close() {
    this.visible = false;
    this.resetForm();
  }

  // =========================
  // FORM
  // =========================

  onSave(form: NgForm) {
    if (form.invalid) {
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }

    this.submitAction();
  }

  private resetForm(preserveId: boolean = false) {
    this.submitted = false;

    this.full_name = '';
    this.email = '';
    this.mobile_number = '';
    this.username = '';
    this.password = '';

    this.clearFileControls();

    if (!preserveId) {
      this.currentID = null;
    }
  }

  // =========================
  // IMAGE
  // =========================

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.selectedFile = file;
    this.fileName = file?.name ?? '';

    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  removeImage() {
    this.clearFileControls();
  }

  private clearFileControls() {
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = null;
    this.selectedFile = null;
    this.fileName = '';

    setTimeout(() => {
      if (this.fileInputRef?.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
      }
    });
  }



  private submitAction() {
    const payload: CreateParentPayload = {
      full_name: this.full_name,
      email: this.email,
      mobile_number: this.mobile_number,
      username: this.username,
      password: this.password,
    };

    if (this.mode === ModalMode.ADD) {
      this.createParent(payload);
    } else {
      this.updateParent(payload);
    }
  }

  private createParent(payload: CreateParentPayload) {
    this.parentService.createParent(payload, this.selectedFile).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message);
        this.onSuccess.emit();
        this.close();
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
      },
    });
  }

  private updateParent(payload: CreateParentPayload) {
    if (!this.currentID) return;

    this.parentService
      .updateParent(this.currentID, payload, this.selectedFile)
      .subscribe({
        next: (res: any) => {
          this.toast.success('Success', res.message);
          this.onSuccess.emit();
          this.close();
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? 'Something went wrong.';
          this.toast.error('Error', msg);
        },
      });
  }

  private getParentById(id: number) {
    this.parentService.getParentById(id).subscribe({
      next: (response: any) => {
        const data = response.data;

        this.full_name = data.full_name;
        this.email = data.email;
        this.mobile_number = data.mobile_number;
        this.username = data.username;

        if (data.image_path) {
          this.previewUrl = this.parentService.fileAPIUrl + data.image_path;
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to load parent details.';
        this.toast.error('Error', msg);
      },
    });
  }
}