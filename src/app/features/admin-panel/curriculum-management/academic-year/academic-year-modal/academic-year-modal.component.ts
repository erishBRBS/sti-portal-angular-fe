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
import { SelectModule } from 'primeng/select';
import { ModalMode } from '../../../../../enums/modal.mode';
import { AcademicYearService } from '../../../../../services/admin-panel/curriculum-management/academic-year.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateAcademicYearPayload } from '../../../../../payloads/admin-panel/curriculum/academic-year/create-academic-year.payload';

@Component({
  selector: 'sti-academic-year-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './academic-year-modal.component.html',
  styleUrl: './academic-year-modal.component.css',
})
export class AcademicYearModalComponent {

  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('academicYearForm') academicYearFormRef?: NgForm;

  private readonly academicYearService = inject(AcademicYearService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: ModalMode = ModalMode.ADD;

  academic_year = '';
  semester = '';

  currentID = 0;
  pendingEditId: number | null = null;

  // 🔥 Dropdown options
  semesterOptions = [
    { label: '1st Semester', value: '1st Semester' },
    { label: '2nd Semester', value: '2nd Semester' },
    { label: 'Summer', value: 'Summer' },
  ];

  get dialogTitle(): string {
    if (this.mode === ModalMode.ADD) return 'Add Academic Year';
    if (this.mode === ModalMode.UPDATE) return 'Update Academic Year';
    return 'View Academic Year';
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
      this.getAcademicYearById(id);
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
      this.getAcademicYearById(id);
    });
  }

  onDialogShown() {
    if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
      const id = this.pendingEditId;

      setTimeout(() => {
        this.getAcademicYearById(id);
      }, 0);

      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;
    this.academic_year = '';
    this.semester = '';

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  close() {
    this.submitted = false;
    this.academic_year = '';
    this.semester = '';
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
    const payload: CreateAcademicYearPayload = {
      academic_year: this.academic_year,
      semester: this.semester,
    };

    this.academicYearService.createAcademicYear(payload).subscribe({
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
    const payload: CreateAcademicYearPayload = {
      academic_year: this.academic_year,
      semester: this.semester,
    };

    this.academicYearService.updateAcademicYear(this.currentID, payload).subscribe({
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

  private getAcademicYearById(id: number): void {
    this.academicYearService.getAcademicYearById(id).subscribe({
      next: (response) => {
        const data = response.data;

        this.academic_year = data.academic_year;
        this.semester = data.semester;

        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load academic year.';
        this.toast.error('Error', msg);
      },
    });
  }
}