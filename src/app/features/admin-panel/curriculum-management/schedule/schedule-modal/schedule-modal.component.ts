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
import { DatePickerModule } from 'primeng/datepicker';

import { CourseService } from '../../../../../services/admin-panel/curriculum-management/course.service';
import { SectionService } from '../../../../../services/admin-panel/curriculum-management/section.service';
import { SubjectService } from '../../../../../services/admin-panel/curriculum-management/subject.service';
import { ProfessorService } from '../../../../../services/admin-panel/user-management/professor/professor.service';
import { ScheduleService } from '../../../../../services/admin-panel/curriculum-management/schedule.service';

import { ModalMode } from '../../../../../enums/modal.mode';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CreateSchedulePayload } from '../../../../../payloads/admin-panel/curriculum/schedule/create-schedule.payload';

@Component({
  selector: 'sti-schedule-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule
  ],
  templateUrl: './schedule-modal.component.html',
  styleUrl: './schedule-modal.component.css',
})
export class ScheduleModalComponent {

  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('scheduleForm') scheduleFormRef?: NgForm;

  private readonly scheduleService = inject(ScheduleService);
  private readonly courseService = inject(CourseService);
  private readonly sectionService = inject(SectionService);
  private readonly professorService = inject(ProfessorService);
  private readonly subjectService = inject(SubjectService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  loading = false;

  mode: ModalMode = ModalMode.ADD;

  currentID = 0;
  pendingEditId: number | null = null;

  /* ============================
     DROPDOWN DATA
  ============================ */

  courses: any[] = [];
  sections: any[] = [];
  professors: any[] = [];
  subjects: any[] = [];

  days = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' }
  ];

  /* ============================
     FORM VALUES
  ============================ */

  course_id!: number;
  section_id!: number;
  professor_id!: number;
  subject_id!: number;

  day = '';
  start_time: any;
  end_time: any;
  duration = '';
  room = '';

  /* ============================
     DIALOG TEXT
  ============================ */

  get dialogTitle(): string {
    return this.mode === ModalMode.ADD ? 'Add Schedule' : 'Update Schedule';
  }

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
  }

  /* ============================
     SHOW MODAL
  ============================ */

  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = 0;
    this.visible = true;
    this.resetForm();
    this.loadDropdowns();
  }

updateDialog(id: number): void {
  this.mode = ModalMode.UPDATE;
  this.currentID = id;
  this.pendingEditId = id;

  this.resetForm(true);
  this.loadDropdowns();

  this.visible = true;
}

onDialogShown(): void {
  if (this.mode === ModalMode.UPDATE && this.pendingEditId) {
    this.getScheduleById(this.pendingEditId);
    this.pendingEditId = null;
  }
}

  /* ============================
     LOAD DROPDOWN DATA
  ============================ */

  private loadDropdowns() {

    this.courseService.getCourse().subscribe((res: any) => {
      this.courses = res.data.map((c: any) => ({
        label: c.course_code,
        value: c.id
      }));
    });

    this.sectionService.getSection().subscribe((res: any) => {
      this.sections = res.data.map((s: any) => ({
        label: s.section_name,
        value: s.id
      }));
    });

    this.professorService.getProfessor().subscribe((res: any) => {
      this.professors = res.data.map((p: any) => ({
        label: p.professor_name,
        value: p.id
      }));
    });

    this.subjectService.getSubject().subscribe((res: any) => {
      this.subjects = res.data.map((s: any) => ({
        label: s.subject_name,
        value: s.id
      }));
    });

  }

  /* ============================
     RESET FORM
  ============================ */

  private resetForm(preserveCurrentId: boolean = false): void {

    this.submitted = false;

    this.course_id = 0;
    this.section_id = 0;
    this.professor_id = 0;
    this.subject_id = 0;

    this.day = '';
    this.start_time = null;
    this.end_time = null;
    this.duration = '';
    this.room = '';

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  /* ============================
     BUTTON FUNCTIONS
  ============================ */

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
      this.submitAction();
    } else {
      this.submitUpdateAction();
    }
  }

  /* ============================
     CREATE
  ============================ */

  private submitAction(): void {

const payload: CreateSchedulePayload = {
  course_id: this.course_id,
  section_id: this.section_id,
  professor_id: this.professor_id,
  subject_id: this.subject_id,
  day: this.day,
  start_time: this.start_time,
  end_time: this.end_time,
  room: this.room
};

    this.loading = true;

    this.scheduleService.createSchedule(payload).subscribe({
      next: (res: any) => {

        this.toast.success('Success', res.message);

        this.resetForm();
        this.onSuccess.emit();
        this.close();

        this.loading = false;
      },

      error: (err: any) => {

        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(err);

        this.loading = false;
      }
    });
  }

  /* ============================
     UPDATE
  ============================ */

  private submitUpdateAction(): void {

    const payload: CreateSchedulePayload = {
      course_id: this.course_id,
      section_id: this.section_id,
      professor_id: this.professor_id,
      subject_id: this.subject_id,
      day: this.day,
      start_time: this.start_time,
      end_time: this.end_time,
      duration: this.duration,
      room: this.room
    };

    this.loading = true;

    this.scheduleService.updateSchedule(this.currentID, payload).subscribe({

      next: (res: any) => {

        this.toast.success('Success', res.message);

        this.resetForm();
        this.onSuccess.emit();
        this.close();

        this.loading = false;
      },

      error: (err: any) => {

        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(err);

        this.loading = false;
      }

    });
  }

  /* ============================
     GET BY ID
  ============================ */

  private getScheduleById(id: number): void {

    this.loading = true;

    this.scheduleService.getScheduleById(id).subscribe({

      next: (response: any) => {

        const data = response.data;

        this.course_id = data.course_id;
        this.section_id = data.section_id;
        this.professor_id = data.professor_id;
        this.subject_id = data.subject_id;

        this.day = data.day;
        this.start_time = data.start_time;
        this.end_time = data.end_time;
        this.duration = data.duration;
        this.room = data.room;

        this.cdr.detectChanges();

        this.loading = false;
      },

      error: (err: any) => {

        const msg = err?.error?.message ?? 'Failed to load schedule details.';

        this.toast.error('Error', msg);
        console.error(err);

        this.loading = false;
      }

    });

  }

}