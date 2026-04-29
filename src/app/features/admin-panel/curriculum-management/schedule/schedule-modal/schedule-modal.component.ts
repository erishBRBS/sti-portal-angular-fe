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
import { ModalMode } from '../../../../../enums/modal.mode';
import { CourseService } from '../../../../../services/admin-panel/curriculum-management/course.service';
import { SectionService } from '../../../../../services/admin-panel/curriculum-management/section.service';
import { SubjectService } from '../../../../../services/admin-panel/curriculum-management/subject.service';
import { ProfessorService } from '../../../../../services/admin-panel/user-management/professor/professor.service';
import { ScheduleService } from '../../../../../services/admin-panel/curriculum-management/schedule.service';
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
    DatePickerModule,
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
    { label: 'Saturday', value: 'Saturday' },
  ];

  rooms = [
    { label: '101', value: 'Room 101' },
    { label: '103', value: 'Room 103' },
    { label: '104', value: 'Room 104' },
    { label: '106', value: 'Room 106' },
    { label: '108', value: 'Room 108' },
    { label: '110', value: 'Room 110' },
    { label: '111', value: 'Room 111' },
    { label: '112', value: 'Room 112' },
    { label: '113', value: 'Room 113' },

    { label: '203', value: 'Room 203' },
    { label: '204', value: 'Room 204' },
    { label: '206', value: 'Room 206' },
    { label: '207', value: 'Room 207' },
    { label: '208', value: 'Room 208' },
    { label: '210', value: 'Room 210' },
    { label: '212', value: 'Room 212' },
    { label: '214', value: 'Room 214' },
    { label: '215', value: 'Room 215' },
    { label: '216', value: 'Room 216' },
    { label: '217-A', value: 'Room 217-A' },
    { label: '218-A', value: 'Room 218-A' },
    { label: '219-A', value: 'Room 219-A' },

    { label: '301', value: 'Room 301' },
    { label: '302', value: 'Room 302' },
    { label: '303', value: 'Room 303' },
    { label: '304', value: 'Room 304' },

    { label: 'L1', value: 'Room L1' },
    { label: 'L2', value: 'Room L2' },
    { label: 'L3', value: 'Room L3' },
    { label: 'L4', value: 'Room L4' },

    { label: 'PE1', value: 'Room PE1' },
    { label: 'PE2', value: 'Room PE2' },
    { label: 'PE3', value: 'Room PE3' },
  ];

  hours = [
    { label: '1 Hour', value: '1Hr' },
    { label: '1.5 Hours', value: '1.5Hrs' },
    { label: '2 Hours', value: '2Hrs' },
    { label: '3 Hours', value: '3Hrs' },
  ];

  /* ============================
     FORM VALUES
  ============================ */

  course_code: string = '';
  section_id!: number;
  professor_id!: number;
  subject_id!: number;

  day = '';
  start_time: Date | string | null = null;
  end_time: Date | string | null = null;
  duration = '';
  room = '';

  /* ============================
     DIALOG TEXT
  ============================ */

  get dialogTitle(): string {
    if (this.mode === ModalMode.ADD) return 'Add Schedule';

    if (this.mode === ModalMode.UPDATE) return 'Update Schedule';

    return 'View Schedule';
  }

  get dialogButtonLabel(): string {
    return this.mode === ModalMode.ADD ? 'Add Record' : 'Update Record';
  }

  /* ============================
     TIME HELPERS
  ============================ */

  private formatTimeToHi(value: Date | string | null | undefined): string {
    if (!value) return '';

    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

    if (match) {
      let hours = Number(match[1]);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }

      if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return value;
  }

  private parseTimeToDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return value;
    }

    let hours = 0;
    let minutes = 0;

    const hiMatch = value.match(/^(\d{1,2}):(\d{2})$/);

    if (hiMatch) {
      hours = Number(hiMatch[1]);
      minutes = Number(hiMatch[2]);
    } else {
      const amPmMatch = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

      if (!amPmMatch) return null;

      hours = Number(amPmMatch[1]);
      minutes = Number(amPmMatch[2]);

      const period = amPmMatch[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      }

      if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date;
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

  viewDialog(id: number): void {
    this.mode = ModalMode.VIEW;
    this.currentID = id;

    this.resetForm(true);
    this.loadDropdowns();
    this.visible = true;

    setTimeout(() => {
      this.getScheduleById(id);
    }, 0);
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
    this.courseService.listAllCourse().subscribe((res: any) => {
      this.courses = (res.data ?? []).map((c: any) => ({
        label: c.course_code,
        value: c.id,
      }));
    });

    this.sectionService.listAllSection().subscribe((res: any) => {
      this.sections = (res.data ?? []).map((s: any) => ({
        label: s.section_name,
        value: s.id,
      }));
    });

    this.professorService.listAllProfessors().subscribe((res: any) => {
      this.professors = (res.data ?? []).map((p: any) => ({
        label: p.full_name,
        value: p.id,
      }));
    });

    this.subjectService.listAllSubjects().subscribe((res: any) => {
      this.subjects = (res.data ?? []).map((s: any) => ({
        label: s.subject_name,
        value: s.id,
      }));
    });
  }

  /* ============================
     RESET FORM
  ============================ */

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;

    this.course_code = '';
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
      course_code: this.course_code,
      section_id: this.section_id,
      professor_id: this.professor_id,
      subject_id: this.subject_id,
      day: this.day,
      start_time: this.formatTimeToHi(this.start_time),
      end_time: this.formatTimeToHi(this.end_time),
      duration: this.duration,
      room: this.room,
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
      },
    });
  }

  /* ============================
     UPDATE
  ============================ */

  private submitUpdateAction(): void {
    const payload: CreateSchedulePayload = {
      course_code: this.course_code,
      section_id: this.section_id,
      professor_id: this.professor_id,
      subject_id: this.subject_id,
      day: this.day,
      start_time: this.formatTimeToHi(this.start_time),
      end_time: this.formatTimeToHi(this.end_time),
      duration: this.duration,
      room: this.room,
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
      },
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

        this.course_code = data.course_code;
        this.section_id = data.section_id;
        this.professor_id = data.professor_id;
        this.subject_id = data.subject_id;

        this.day = data.day;
        this.start_time = this.parseTimeToDate(data.start_time);
        this.end_time = this.parseTimeToDate(data.end_time);
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
      },
    });
  }
}
