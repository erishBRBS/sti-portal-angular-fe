import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { GradePortalService } from '../../../../../services/gps/professor/professor.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateStudentGradePayload } from '../../../../../payloads/gps/professor/professor.payload';

type GradeModalMode = 'ADD' | 'UPDATE' | 'VIEW';

@Component({
  selector: 'sti-grade-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './grade-management-modal.component.html',
})
export class GradeModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('gradeForm') gradeFormRef?: NgForm;

  private readonly gradePortalService = inject(GradePortalService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  mode: GradeModalMode = 'ADD';

  currentID = 0;
  student_id = 0;
  schedule_id = 0;

  prelim_grade: number | null = null;
  midterm_grade: number | null = null;
  pre_finals_grade: number | null = null;
  finals_grade: number | null = null;
  status: string | null = null;

  currentStudentName = '';
  currentSubjectName = '';
  currentSectionName = '';

  get dialogTitle(): string {
    if (this.mode === 'ADD') return 'Add Grade';
    if (this.mode === 'UPDATE') return 'Update Grade';
    return 'View Grade';
  }

  get dialogButtonLabel(): string {
    return this.mode === 'ADD' ? 'Add Record' : 'Update Record';
  }

  showDialog(payload: {
    student_id: number;
    schedule_id: number;
    student_name: string;
    subject_name: string;
    section_name: string;
  }): void {
    this.mode = 'ADD';
    this.currentID = 0;
    this.visible = true;

    this.student_id = payload.student_id;
    this.schedule_id = payload.schedule_id;
    this.currentStudentName = payload.student_name;
    this.currentSubjectName = payload.subject_name;
    this.currentSectionName = payload.section_name;

    this.prelim_grade = null;
    this.midterm_grade = null;
    this.pre_finals_grade = null;
    this.finals_grade = null;
    this.status = null;
    this.submitted = false;

    this.cdr.detectChanges();
  }

  updateDialog(payload: {
    id: number;
    student_id: number;
    schedule_id: number;
    student_name: string;
    subject_name: string;
    section_name: string;
    prelim: number | null;
    midterm: number | null;
    pre_finals: number | null;
    finals: number | null;
    status: string | null;
  }): void {
    this.mode = 'UPDATE';
    this.currentID = payload.id;
    this.visible = true;

    this.student_id = payload.student_id;
    this.schedule_id = payload.schedule_id;
    this.currentStudentName = payload.student_name;
    this.currentSubjectName = payload.subject_name;
    this.currentSectionName = payload.section_name;

    this.prelim_grade = payload.prelim;
    this.midterm_grade = payload.midterm;
    this.pre_finals_grade = payload.pre_finals;
    this.finals_grade = payload.finals;
    this.status = payload.status;

    this.submitted = false;
    this.cdr.detectChanges();
  }

  close(): void {
    this.visible = false;
    this.submitted = false;
    this.onCancel.emit();
  }

  onSave(form: NgForm): void {
    if (form.invalid) {
      this.submitted = true;
      form.control.markAllAsTouched();
      return;
    }

    if (this.mode === 'ADD') {
      this.submitCreate();
    } else {
      this.submitUpdate();
    }
  }

  private submitCreate(): void {
    const payload: CreateStudentGradePayload = {
      student_id: this.student_id,
      schedule_id: this.schedule_id,
      prelim_grade: this.prelim_grade,
      midterm_grade: this.midterm_grade,
      pre_finals_grade: this.pre_finals_grade,
      finals_grade: this.finals_grade,
      status: this.status as any,
    };

    this.gradePortalService.createStudentGrade(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.visible = false;
        this.onSuccess.emit();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to create grade.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private submitUpdate(): void {
    const payload: CreateStudentGradePayload = {
      student_id: this.student_id,
      schedule_id: this.schedule_id,
      prelim_grade: this.prelim_grade,
      midterm_grade: this.midterm_grade,
      pre_finals_grade: this.pre_finals_grade,
      finals_grade: this.finals_grade,
      status: this.status as any,
    };

    this.gradePortalService.updateStudentGrade(this.currentID, payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.visible = false;
        this.onSuccess.emit();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to update grade.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }
}