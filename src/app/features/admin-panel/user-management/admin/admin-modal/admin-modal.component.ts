import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CreateAdminPayload } from '../../../../../payloads/admin-panel/user-management/admin/create-admin.payload';
import { ModalMode } from '../../../../../enums/modal.mode';
import { AdminService } from '../../../../../services/admin-panel/user-management/admin/admin.service';
import { ToastService } from '../../../../../shared/services/toast.service';

export type AdminModalMode = 'add' | 'edit';

@Component({
  selector: 'sti-admin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule,],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.css',
})
export class AdminModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('adminForm') adminFormRef?: NgForm;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  // template-driven fields
  full_name = '';
  email = '';
  mobile_number = '';
  username = '';
  password = '';
  showPassword = false;

  togglePassword() {
  this.showPassword = !this.showPassword;
}
allowNumbersOnly(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;

  // allow numbers 0-9 only
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
  // file state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileName = '';
  currentID: number | null = null;
  pendingEditId: number | null = null;

  @ViewChild('imagePathInput') imagePathInputRef!: ElementRef<HTMLInputElement>;

  get dialogTitle(): string {
    return this.mode === ModalMode.ADD ? 'Add Admin' : 'Update Admin';
  }

  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = null;
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
      this.getAdminById(id);
    });
  }

  onDialogShown(): void {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      this.getAdminById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;

    this.full_name = '';
    this.email = '';
    this.mobile_number = '';
    this.username = '';
    this.password = '';

    this.clearFileControls();

    if (!preserveCurrentId) {
      this.currentID = null;
    }
  }

  private clearFileControls(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.fileName = '';
    this.selectedFile = null;
    this.previewUrl = null;

    // reset actual <input type="file"> values
    // setTimeout to ensure ViewChild exists (esp. after dialog hide/show)
    setTimeout(() => {
      if (this.imagePathInputRef?.nativeElement) this.imagePathInputRef.nativeElement.value = '';
    });
  }

  // MARK: - Button Function
  close() {
    // reset state first
    this.submitted = false;

    this.full_name = '';
    this.email = '';
    this.mobile_number = '';
    this.username = '';
    this.password = '';


    this.clearFileControls();

    // emit last
    this.visible = false;
  }

  onSave(form: NgForm) {
    if (form.invalid) {
      // show errors again if something changed
      console.log('form invalid');
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }
    this.submitAction();
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    // cleanup old blob preview
    if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);

    this.selectedFile = file;
    this.fileName = file?.name ?? '';

    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  removeImage() {
    this.clearFileControls();
  }
  // MARK: - API Function
  private submitAction(): void {
    const payload: CreateAdminPayload = {
      full_name: this.full_name,
      email: this.email,
      mobile_number: this.mobile_number,
      username: this.username,
      password: this.password,
    };

    this.adminService.createAdmin(payload, this.selectedFile).subscribe({
      next: (res) => {
        // success
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

  private getAdminById(id: number): void {
    this.adminService.getAdminById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.full_name = data.full_name;
        this.email = data.email;
        this.mobile_number = data.mobile_number;
        this.username = data.username;

        // para sa existing image preview
        this.previewUrl = this.adminService.fileAPIUrl + data.image_path;
        console.log('fileDito', this.previewUrl);
        this.cdr.detectChanges();
        // this.fileName = data.image_path;
        // this.selectedFile = null;
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load admin details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }
}

