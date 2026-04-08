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
import { forkJoin } from 'rxjs';
import { ModalMode } from '../../../../../enums/modal.mode';
import { StudentScheduleService } from '../../../../../services/admin-panel/association/student-schedule.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { AssignStudentSchedulePayload } from '../../../../../payloads/admin-panel/association/student-schedule/student-schedule.payload';
import { StudentService } from '../../../../../services/admin-panel/user-management/student/student.service';
import { ScheduleService } from '../../../../../services/admin-panel/curriculum-management/schedule.service';

type SelectOption = {
  label: string;
  value: number;
};

@Component({
  selector: 'sti-student-schedule-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './student-schedule-modal.component.html',
})
export class StudentScheduleModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @ViewChild('studentScheduleForm') studentScheduleFormRef?: NgForm;

  private readonly studentScheduleService = inject(StudentScheduleService);
  private readonly studentService = inject(StudentService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitted = false;
  visible = false;
  loadingOptions = false;
  mode: ModalMode = ModalMode.ADD;

  student_id: number | null = null;
  schedule_id: number | null = null;

  student_name = '';
  course_name = '';
  section_name = '';
  year_level = '';
  subject_name = '';

  schedule_day = '';
  schedule_start_time = '';
  schedule_end_time = '';
  schedule_duration = '';
  schedule_room = '';

  currentID = 0;
  pendingEditId: number | null = null;

  studentOptions: SelectOption[] = [];
  scheduleOptions: SelectOption[] = [];

  private studentLookup: any[] = [];
  private scheduleLookup: any[] = [];
  private currentDetail: any = null;

  get dialogTitle(): string {
    if (this.mode === ModalMode.ADD) return 'Add Student to Schedule';
    if (this.mode === ModalMode.UPDATE) return 'Update Student to Schedule';
    return 'Student Schedule Details';
  }

  showDialog(): void {
    this.mode = ModalMode.ADD;
    this.currentID = 0;
    this.visible = true;
    this.resetForm();
    this.loadDropdownOptions();
  }

  viewDialog(id: number): void {
    this.mode = ModalMode.VIEW;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);
    this.loadDropdownOptions();

    setTimeout(() => {
      this.getStudentScheduleById(id);
    });
  }

  updateDialog(id: number): void {
    this.mode = ModalMode.UPDATE;
    this.currentID = id;
    this.pendingEditId = id;
    this.visible = true;
    this.resetForm(true);
    this.loadDropdownOptions();

    setTimeout(() => {
      this.getStudentScheduleById(id);
    });
  }

  onDialogShown(): void {
    if ((this.mode === ModalMode.UPDATE || this.mode === ModalMode.VIEW) && this.pendingEditId) {
      this.getStudentScheduleById(this.pendingEditId);
      this.pendingEditId = null;
    }
  }

  private resetForm(preserveCurrentId: boolean = false): void {
    this.submitted = false;
    this.student_id = null;
    this.schedule_id = null;

    this.student_name = '';
    this.course_name = '';
    this.section_name = '';
    this.year_level = '';
    this.subject_name = '';

    this.schedule_day = '';
    this.schedule_start_time = '';
    this.schedule_end_time = '';
    this.schedule_duration = '';
    this.schedule_room = '';

    this.currentDetail = null;

    if (!preserveCurrentId) {
      this.currentID = 0;
    }
  }

  private loadDropdownOptions(): void {
    this.loadingOptions = true;

    forkJoin({
      students: this.studentService.listAllStudents(),
      schedules: this.scheduleService.listAllSchedules(),
    }).subscribe({
      next: ({ students, schedules }) => {
        this.studentLookup = students.data ?? [];
        this.scheduleLookup = schedules.data ?? [];

        this.studentOptions = this.studentLookup.map((student: any) => ({
          value: student.id,
          label: [
            `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim(),
            student.course?.course_name ?? '-',
            student.section?.section_name ?? '-',
            student.year_level ?? '-',
          ].join(' - '),
        }));

        this.scheduleOptions = this.scheduleLookup.map((schedule: any) => ({
          value: schedule.id,
          label: schedule.subject?.subject_name ?? '-',
        }));

        this.loadingOptions = false;

        if (this.currentDetail) {
          this.resolveDisplayFields();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingOptions = false;
        this.studentOptions = [];
        this.scheduleOptions = [];
        this.studentLookup = [];
        this.scheduleLookup = [];
        this.toast.error('Error', 'Failed to load student/schedule list');
      },
    });
  }

  close() {
    this.submitted = false;
    this.visible = false;
    this.student_id = null;
    this.schedule_id = null;

    this.student_name = '';
    this.course_name = '';
    this.section_name = '';
    this.year_level = '';
    this.subject_name = '';

    this.schedule_day = '';
    this.schedule_start_time = '';
    this.schedule_end_time = '';
    this.schedule_duration = '';
    this.schedule_room = '';

    this.currentDetail = null;

    this.onCancel.emit();
  }

  onSave(form: NgForm) {
    if (this.mode === ModalMode.VIEW) return;

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
    const payload: AssignStudentSchedulePayload = {
      student_id: this.student_id!,
      schedule_id: this.schedule_id!,
    };

    this.studentScheduleService.createStudentSchedule(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private submitUpdateAction(): void {
    const payload: AssignStudentSchedulePayload = {
      student_id: this.student_id!,
      schedule_id: this.schedule_id!,
    };

    this.studentScheduleService.updateStudentSchedule(this.currentID, payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.resetForm();
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private getStudentScheduleById(id: number): void {
    this.studentScheduleService.getStudentScheduleById(id).subscribe({
      next: (response) => {
        const data: any = response.data;
        this.currentDetail = data;

        const studentRef: any = data.student ?? data.student_id ?? null;
        const scheduleRef: any = data.schedule ?? data.schedule_id ?? null;

        this.student_id =
          typeof studentRef === 'number'
            ? studentRef
            : typeof studentRef === 'object' && studentRef !== null
              ? (studentRef.id ?? null)
              : null;

        this.schedule_id =
          typeof scheduleRef === 'number'
            ? scheduleRef
            : typeof scheduleRef === 'object' && scheduleRef !== null
              ? (scheduleRef.id ?? null)
              : null;

        this.resolveDisplayFields();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to load student-schedule details.';
        this.toast.error('Error', msg);
        console.error(err);
      },
    });
  }

  private resolveDisplayFields(): void {
    const data: any = this.currentDetail ?? {};

    const studentRef: any = data.student ?? data.student_id ?? this.student_id ?? null;
    const scheduleRef: any = data.schedule ?? data.schedule_id ?? this.schedule_id ?? null;

    const studentId =
      typeof studentRef === 'number'
        ? studentRef
        : typeof studentRef === 'object' && studentRef !== null
          ? (studentRef.id ?? null)
          : null;

    const scheduleId =
      typeof scheduleRef === 'number'
        ? scheduleRef
        : typeof scheduleRef === 'object' && scheduleRef !== null
          ? (scheduleRef.id ?? null)
          : null;

    const matchedStudent = this.studentLookup.find((student: any) => student.id === studentId);
    const matchedSchedule = this.scheduleLookup.find((schedule: any) => schedule.id === scheduleId);

    this.student_name =
      `${matchedStudent?.first_name ?? data.student?.first_name ?? ''} ${matchedStudent?.last_name ?? data.student?.last_name ?? ''}`.trim() ||
      '-';

    this.course_name =
      matchedStudent?.course?.course_name ?? data.student?.course?.course_name ?? '-';

    this.section_name =
      matchedStudent?.section?.section_name ?? data.student?.section?.section_name ?? '-';

    this.year_level = matchedStudent?.year_level ?? data.student?.year_level ?? '-';

    this.subject_name =
      matchedSchedule?.subject?.subject_name ?? data.schedule?.subject?.subject_name ?? '-';

    this.schedule_day = matchedSchedule?.day ?? data.schedule?.day ?? '-';

    this.schedule_start_time = matchedSchedule?.start_time ?? data.schedule?.start_time ?? '-';

    this.schedule_end_time = matchedSchedule?.end_time ?? data.schedule?.end_time ?? '-';

    this.schedule_duration = matchedSchedule?.duration ?? data.schedule?.duration ?? '-';

    this.schedule_room = matchedSchedule?.room ?? data.schedule?.room ?? '-';
  }

  formatTime(value?: string | null): string {
    if (!value) return '-';

    const parts = value.split(':');
    const rawHour = Number(parts[0] ?? 0);
    const rawMinute = parts[1] ?? '00';

    const suffix = rawHour >= 12 ? 'pm' : 'am';
    const hour = rawHour % 12 || 12;

    if (rawMinute === '00') {
      return `${hour}${suffix}`;
    }

    return `${hour}:${rawMinute}${suffix}`;
  }
}
