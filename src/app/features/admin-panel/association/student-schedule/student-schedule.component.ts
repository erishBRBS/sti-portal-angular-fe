import { ChangeDetectorRef, Component, ViewChild, inject } from '@angular/core';
import {
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentScheduleService } from '../../../../services/admin-panel/association/student-schedule.service';
import { StudentScheduleModalComponent } from './student-schedule-modal/student-schedule-modal.component';
import { StudentService } from '../../../../services/admin-panel/user-management/student/student.service';
import { ScheduleService } from '../../../../services/admin-panel/curriculum-management/schedule.service';

type StudentScheduleRow = {
  id: number;
  student_name: string;
  course: string;
  section: string;
  year_level: string;
  subject: string;
};

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [DataTableComponent, StudentScheduleModalComponent, ConfirmDialogComponent],
  templateUrl: './student-schedule.component.html',
})
export class StudentScheduleComponent {
  cols: TableColumn<StudentScheduleRow>[] = [
    { field: 'student_name', header: 'Student Name', sortable: true, filter: true },
    { field: 'course', header: 'Course', sortable: true, filter: true },
    { field: 'section', header: 'Section', sortable: true, filter: true },
    { field: 'year_level', header: 'Year Level', sortable: true, filter: true },
    { field: 'subject', header: 'Subject', sortable: true, filter: true },
  ];

  actions: RowAction<StudentScheduleRow>[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye', buttonClass: 'text-rose-600' },
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'delete', label: 'Delete', icon: 'pi pi-trash', buttonClass: 'text-rose-600' },
  ];

  private readonly studentScheduleService = inject(StudentScheduleService);
  private readonly studentService = inject(StudentService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  @ViewChild(StudentScheduleModalComponent) studentScheduleModal!: StudentScheduleModalComponent;

  loading = false;
  rowsPerPage = 12;
  rows: StudentScheduleRow[] = [];

  currentPage = 1;
  total = 0;
  first = 0;

  selectedRows: StudentScheduleRow[] = [];
  selectedDeleteId: number | null = null;

  ngOnInit(): void {
    this.loadStudentSchedule(1, this.rowsPerPage);
  }

  onRow(row: StudentScheduleRow) {
    console.log('row click', row);
  }

  onAction(e: { actionKey: string; row: StudentScheduleRow }) {
    if (e.actionKey === 'view') {
      this.studentScheduleModal.viewDialog(e.row.id);
    } else if (e.actionKey === 'edit') {
      this.studentScheduleModal.updateDialog(e.row.id);
    } else if (e.actionKey === 'delete') {
      this.deleteStudentSchedule(e.row.id);
    }
  }

  openAddModal() {
    this.studentScheduleModal?.showDialog();
  }

  openDeleteModal() {
    if (!this.selectedRows.length) {
      this.toast.error('Error', 'Please select a record to delete.');
      return;
    }

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete selected student-schedule assignments?',
    });
  }

  onPageChanged(e: { page: number; perPage: number; first: number }) {
    this.first = e.first;
    this.rowsPerPage = e.perPage;
    this.loadStudentSchedule(e.page, e.perPage);
  }

  onModalSuccess(): void {
    this.loadStudentSchedule(1, this.rowsPerPage);
  }

  onModalCancel(): void {
    console.log('Student-schedule form cancelled');
  }

  loadStudentSchedule(page: number, perPage: number) {
    this.loading = true;

    forkJoin({
      assignments: this.studentScheduleService.getStudentSchedule(page, perPage),
      students: this.studentService.listAllStudents().pipe(
        catchError((err) => {
          console.warn('listAllStudents failed', err);
          return of({ data: [] as any[] });
        }),
      ),
      schedules: this.scheduleService.listAllSchedules().pipe(
        catchError((err) => {
          console.warn('listAllSchedules failed', err);
          return of({ data: [] as any[] });
        }),
      ),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ assignments, students, schedules }) => {
          const studentMap = new Map(
            (students.data ?? []).map((student: any) => [student.id, student]),
          );

          const scheduleMap = new Map(
            (schedules.data ?? []).map((schedule: any) => [schedule.id, schedule]),
          );

          const mapped = assignments.data.map((a: any) => {
            const studentId =
              typeof a.student === 'object' && a.student !== null
                ? a.student.id
                : (a.student_id ?? null);

            const scheduleId =
              typeof a.schedule === 'object' && a.schedule !== null
                ? a.schedule.id
                : (a.schedule_id ?? null);

            const student = studentMap.get(studentId);
            const schedule = scheduleMap.get(scheduleId);

            return {
              id: a.id,
              student_name:
                `${student?.first_name ?? a.student?.first_name ?? ''} ${student?.last_name ?? a.student?.last_name ?? ''}`.trim() ||
                '-',
              course: student?.course?.course_name ?? a.student?.course?.course_name ?? '-',
              section: student?.section?.section_name ?? a.student?.section?.section_name ?? '-',
              year_level: student?.year_level ?? a.student?.year_level ?? '-',
              subject: schedule?.subject?.subject_name ?? a.schedule?.subject?.subject_name ?? '-',
            };
          });

          queueMicrotask(() => {
            this.currentPage = assignments.pagination.current_page;
            this.total = assignments.pagination.total;
            this.first = (assignments.pagination.current_page - 1) * perPage;
            this.rows = mapped;
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          console.error('getStudentSchedule failed', err);
          this.rows = [];

          // Huwag na mag-toast sa initial refresh auth/network flicker
          if (err?.status !== 401 && err?.status !== 0) {
            this.toast.error('Error', 'Failed to load student schedule.');
          }
        },
      });
  }

  deleteStudentSchedule(id: number) {
    this.selectedDeleteId = id;

    this.confirmDialog.open({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this student-schedule assignment?',
    });
  }

  confirmDelete() {
    if (this.selectedRows.length) {
      const payload = {
        id: this.selectedRows.map((row: StudentScheduleRow) => row.id),
      };

      this.studentScheduleService.deleteStudentSchedule(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message);
          this.selectedRows = [];
          this.loadStudentSchedule(this.currentPage, this.rowsPerPage);
        },
        error: () => {
          this.toast.error('Error', 'Failed to delete selected records');
        },
      });

      return;
    }

    if (!this.selectedDeleteId) return;

    const payload = {
      id: [this.selectedDeleteId],
    };

    this.studentScheduleService.deleteStudentSchedule(payload).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message);
        this.loadStudentSchedule(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.toast.error('Error', 'Failed to delete record');
      },
    });
  }

  handleCancelDelete() {
    this.selectedRows = [];
    this.selectedDeleteId = null;
  }
}
