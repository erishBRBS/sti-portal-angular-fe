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

import { CreateStudentPayload } from '../../../../../payloads/admin-panel/user-management/student/create-student.payload';
import { ModalMode } from '../../../../../enums/modal.mode';
import { StudentService } from '../../../../../services/admin-panel/user-management/student/student.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { StudentData } from '../../../../../models/admin-panel/user-management/student/student.model';

@Component({
  selector: 'sti-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './student-modal.component.html',
  styleUrl: './student-modal.component.css',
})
export class StudentModalComponent {

  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @ViewChild('studentForm') studentFormRef?: NgForm;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  private readonly studentService = inject(StudentService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  // form fields
  full_name = '';
  email = '';
  mobile_number = '';
  username = '';
  course = '';
  section = '';
  year_level = '';


  // file state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileName = '';

  currentID = 0;
  pendingEditId: number | null = null;

  get dialogTitle(): string {
    return this.mode === ModalMode.ADD ? 'Add Student' : 'Update Student';
  }

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
  }

  allowNumbersOnly(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
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
      this.getStudentById(id);
    });
  }

  onDialogShown(): void {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      this.getStudentById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {

    this.submitted = false;

    this.full_name = '';
    this.email = '';
    this.mobile_number = '';
    this.username = '';
    this.course = '';
    this.section = '';
    this.year_level = '';
  

    this.clearFileControls();

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  private clearFileControls(): void {

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.fileName = '';
    this.selectedFile = null;
    this.previewUrl = null;

    setTimeout(() => {
      if (this.fileInputRef?.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
      }
    });
  }

  // BUTTON FUNCTIONS
  close() {

    this.submitted = false;

    this.full_name = '';
    this.email = '';
    this.mobile_number = '';
    this.username = '';
  

    this.clearFileControls();

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

  onFileSelected(ev: Event) {

    const input = ev.target as HTMLInputElement;
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

  // CREATE STUDENT
  private submitAction(): void {

    const payload: CreateStudentPayload = {
      full_name: this.full_name,
      email: this.email,
      mobile_number: this.mobile_number,
      username: this.username,
      course: this.course,
      section: this.section,
      year_level: this.year_level,

    };

    this.studentService.createStudent(payload, this.selectedFile).subscribe({

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

  const payload: CreateStudentPayload = {
    full_name: this.full_name,
    email: this.email,
    mobile_number: this.mobile_number,
    username: this.username,
    course: this.course,
    section: this.section,
    year_level: this.year_level,
   
  };

  this.studentService.updateStudent(this.currentID, payload, this.selectedFile)
    .subscribe({
      next: (res: any) => {

        this.toast.success('Success', res.message);

        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err: any) => {

        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
      },
    });
}
private getStudentById(id: number): void {

  this.studentService.getStudentById(id).subscribe({

    next: (response: any) => {

      const data: StudentData = response.data;

      this.full_name =
        data.first_name +
        ' ' +
        (data.middle_name ?? '') +
        ' ' +
        data.last_name;

      this.email = data.email;
      this.mobile_number = data.contact_number ?? '';
      this.username = data.credentials.username;

      this.course = data.course?.course_name ?? '';
      this.section = data.section?.section_name ?? '';
      this.year_level = data.year_level ?? '';

      if (data.image_path) {
        this.previewUrl =
          this.studentService.fileAPIUrl + data.image_path;
      }

      this.cdr.detectChanges();
    },

    error: (err: any) => {
      const msg = err?.error?.message ?? 'Failed to load student details.';
      this.toast.error('Error', msg);
    },

  });

}
}