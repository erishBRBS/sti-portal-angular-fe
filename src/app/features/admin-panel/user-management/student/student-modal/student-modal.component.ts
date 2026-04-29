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
import { SelectModule } from 'primeng/select';
import { CreateStudentPayload } from '../../../../../payloads/admin-panel/user-management/student/create-student.payload';
import { ModalMode } from '../../../../../enums/modal.mode';
import { StudentService } from '../../../../../services/admin-panel/user-management/student/student.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { StudentData } from '../../../../../models/admin-panel/user-management/student/student.model';
import { SectionService } from '../../../../../services/admin-panel/curriculum-management/section.service';
import { CourseService } from '../../../../../services/admin-panel/curriculum-management/course.service';

@Component({
  selector: 'sti-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
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
  private readonly sectionService = inject(SectionService);
  private readonly courseService = inject(CourseService);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  // form fields
  first_name = '';
  middle_name = '';
  last_name = '';
  student_no = '';
  email = '';
  contact_number = '';

  course_id: number | null = null;
  section_id: number | null = null;

  year_level = '';
  username = '';
  rfid_code = '';

  // file state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileName = '';

  currentID = 0;
  pendingEditId: number | null = null;

  courses: any[] = [];
  sections: any[] = [];

  yearLevels = [
    { label: '1st Year', value: '1st Year' },
    { label: '2nd Year', value: '2nd Year' },
    { label: '3rd Year', value: '3rd Year' },
    { label: '4th Year', value: '4th Year' },
  ];

  get dialogTitle(): string {
    if (this.mode === ModalMode.ADD) return 'Add Student';

    if (this.mode === ModalMode.UPDATE) return 'Update Student';

    return 'View Student';
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
    this.loadDropdowns();
  }

  viewDialog(id: number): void {
    this.mode = ModalMode.VIEW;
    this.currentID = id;
    this.visible = true;
    this.loadDropdowns();
    this.resetForm(true);

    setTimeout(() => {
      this.getStudentById(id);
    });
  }

  updateDialog(id: number): void {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.loadDropdowns();
    this.resetForm(true);
    this.visible = true;
  }

  onDialogShown() {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      const id = this.pendingEditId;

      setTimeout(() => {
        this.getStudentById(id);
      }, 0);

      this.pendingEditId = null;
    }
  }

  private loadDropdowns() {
    this.courseService.getCourse().subscribe((res: any) => {
      console.log('COURSES:', res);

      this.courses = res.data.map((c: any) => ({
        label: c.course_name || c.course_code,
        value: c.id,
      }));
    });

    this.sectionService.getSection().subscribe((res: any) => {
      console.log('SECTIONS:', res);

      this.sections = res.data.map((s: any) => ({
        label: s.section_name,
        value: s.id,
      }));
    });
  }
  private loadYearLevels() {
    this.studentService.getStudent().subscribe((res: any) => {
      const unique = new Map();

      res.data.forEach((s: any) => {
        if (s.year_level) {
          unique.set(s.year_level, {
            label: s.year_level,
            value: s.year_level,
          });
        }
      });

      this.yearLevels = Array.from(unique.values());
    });
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;

    this.first_name = '';
    this.middle_name = '';
    this.last_name = '';
    this.student_no = '';
    this.email = '';
    this.contact_number = '';

    this.course_id = null;
    this.section_id = null;

    this.year_level = '';
    this.username = '';
    this.rfid_code = '';

    this.clearFileControls();

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  // BUTTON FUNCTIONS
  close() {
    this.visible = false;
    this.resetForm();
  }

  onSave(form: NgForm) {
    if (form.invalid) {
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }

    if (this.mode === ModalMode.ADD) {
      this.submitAction(); // CREATE
    } else {
      this.submitUpdateAction(); // UPDATE
    }
  }

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

  // CREATE STUDENT
  private submitAction(): void {
    const payload: CreateStudentPayload = {
      first_name: this.first_name,
      middle_name: this.middle_name,
      last_name: this.last_name,
      student_no: this.student_no,
      email: this.email,
      contact_number: this.contact_number,
      course_id: this.course_id ?? 0,
      section_id: this.section_id ?? 0,
      year_level: this.year_level,
      username: this.username,
      rfid_code: this.rfid_code,
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
      first_name: this.first_name,
      middle_name: this.middle_name,
      last_name: this.last_name,
      student_no: this.student_no,
      email: this.email,
      contact_number: this.contact_number,
      course_id: this.course_id ?? 0,
      section_id: this.section_id ?? 0,
    };

    if (this.mode === ModalMode.ADD) {
      this.createStudent(payload);
    } else {
      this.updateStudent(payload);
    }
  }
  private createStudent(payload: CreateStudentPayload) {
    this.studentService.createStudent(payload, this.selectedFile).subscribe({
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

  private updateStudent(payload: CreateStudentPayload) {
    if (!this.currentID) return;

    this.studentService.updateStudent(this.currentID, payload, this.selectedFile).subscribe({
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
  private getStudentById(id: number): void {
    this.studentService.getStudentById(id).subscribe({
      next: (response: any) => {
        const data: StudentData = response.data;
        this.first_name = data.first_name;
        this.middle_name = data.middle_name ?? '';
        this.last_name = data.last_name;

        this.student_no = data.student_no ?? '';
        this.email = data.email;
        this.contact_number = data.contact_number ?? '';

        this.course_id = data.course?.id ?? null;
        this.section_id = data.section?.id ?? null;

        this.year_level = data.year_level ?? '';

        this.username = data.credentials?.username ?? '';
        this.rfid_code = data.credentials?.rfid_code ?? '';

        this.previewUrl = data.image_path
          ? this.studentService.fileAPIUrl + data.image_path.replace('/storage/', '')
          : null;

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        const msg = err?.error?.message ?? 'Failed to load student details.';
        this.toast.error('Error', msg);
      },
    });
  }
}
