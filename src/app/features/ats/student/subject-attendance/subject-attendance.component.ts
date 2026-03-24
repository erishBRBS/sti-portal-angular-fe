import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  StiTagSeverity,
} from '../../../../shared/components/data-table/data-table.component';
import {
  StudentAttendanceItem,
} from './../../../../models/ats/student/student.model';
import { StudentService } from './../../../../services/ats/student/student.service';

interface SubjectAttendanceLog {
  subject: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: 'present' | 'late' | 'absent';
}

@Component({
  selector: 'app-subject-attendance',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './subject-attendance.component.html',
})
export class StudentSubjectAttendanceComponent implements OnInit {
  private studentService = inject(StudentService);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  subjectAttendanceLogs: SubjectAttendanceLog[] = [];
  columns: TableColumn<SubjectAttendanceLog>[] = [];

  rows = 10;
  first = 0;
  totalRecords = 0;
  loading = false;

  ngOnInit(): void {
    this.initializeColumns();

    if (isPlatformBrowser(this.platformId)) {
      this.loadMyAttendance();
    }
  }

  private initializeColumns(): void {
    this.columns = [
      {
        field: 'subject',
        header: 'Subject',
        sortable: true,
      },
      {
        field: 'date',
        header: 'Date',
        type: 'date',
        sortable: true,
        dateFormat: 'MMM d, y',
      },
      {
        field: 'timeIn',
        header: 'Time In',
        sortable: true,
      },
      {
        field: 'timeOut',
        header: 'Time Out',
        sortable: true,
      },
      {
        field: 'status',
        header: 'Status',
        type: 'tag',
        sortable: true,
        tagLabel: (row) => this.getStatusText(row.status),
        tagSeverity: (row) => this.getSeverity(row.status),
        tagClass: (row) => this.getStatusClass(row.status),
      },
    ];
  }

  private loadMyAttendance(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.studentService.getMyAttendance().subscribe({
      next: (response) => {
        const rows = response?.data ?? [];

        this.subjectAttendanceLogs = rows.map((item) =>
          this.mapAttendanceRow(item)
        );
        this.totalRecords =
          response?.pagination?.total ?? this.subjectAttendanceLogs.length;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load subject attendance:', err);
        this.subjectAttendanceLogs = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapAttendanceRow(item: StudentAttendanceItem): SubjectAttendanceLog {
    return {
      subject:
        item.schedule?.subject?.subject_name ||
        item.schedule?.subject?.subject_code ||
        'Unknown Subject',
      date: item.created_at,
      timeIn: item.time_in ? this.formatShortTime(item.time_in) : '-',
      timeOut: item.time_out ? this.formatShortTime(item.time_out) : '-',
      status: this.normalizeStatus(item.status),
    };
  }

  private normalizeStatus(
    status: string | null | undefined
  ): 'present' | 'late' | 'absent' {
    const normalized = String(status ?? '').trim().toLowerCase();

    switch (normalized) {
      case 'present':
        return 'present';
      case 'late':
        return 'late';
      case 'absent':
        return 'absent';
      default:
        return 'absent';
    }
  }

  private formatShortTime(value: string): string {
    const parts = value.split(':');
    const hour = Number(parts[0] ?? 0);
    const minute = parts[1] ?? '00';

    const suffix = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12;

    if (displayHour === 0) displayHour = 12;

    return `${displayHour.toString().padStart(2, '0')}:${minute} ${suffix}`;
  }

  getStatusText(status: SubjectAttendanceLog['status']): string {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      default:
        return 'Unknown';
    }
  }

  getSeverity(status: SubjectAttendanceLog['status']): StiTagSeverity {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warn';
      case 'absent':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusClass(status: SubjectAttendanceLog['status']): string {
    switch (status) {
      case 'present':
        return 'sti-status-present';
      case 'late':
        return 'sti-status-late';
      case 'absent':
        return 'sti-status-absent';
      default:
        return '';
    }
  }
}