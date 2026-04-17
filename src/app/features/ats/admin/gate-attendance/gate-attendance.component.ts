import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import {
  DataTableComponent,
  TableColumn,
  PageChangedEvent,
} from '../../../../shared/components/data-table/data-table.component';
import { GateAttendanceService } from '../../../../services/ats/gate-attendance/gate-attendance.service';

interface AttendanceRecord {
  id: string;
  studentId: string;
  name: string;
  course: string;
  section: string;
  date: string;
  timeIn: string;
  timeOut: string;
  courseSection?: string;
}

@Component({
  selector: 'app-gate-attendance',
  standalone: true,
  imports: [CommonModule, DataTableComponent, FormsModule],
  templateUrl: './gate-attendance.component.html',
})
export class GateAttendanceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  originalRecords: AttendanceRecord[] = [];
  columns: TableColumn<AttendanceRecord>[] = [];

  rows = 12;
  first = 0;
  totalRecords = 0;
  loading = false;
  searchTerm = '';

  constructor(
    private gateAttendanceService: GateAttendanceService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.initializeColumns();

    // Huwag mag-fetch habang SSR
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadAttendance();
      });
    }
  }

  initializeColumns(): void {
    this.columns = [
      {
        field: 'studentId',
        header: 'Student ID',
        sortable: true,
      },
      {
        field: 'name',
        header: 'Name',
        sortable: true,
      },
      {
        field: 'courseSection',
        header: 'Course & Section',
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
    ];
  }

  formatTime(time: string): string {
    if (!time || time === '-') return '-';

    const [hours, minutes, seconds] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  private mapRecords(data: any[]): AttendanceRecord[] {
    return data
      .filter((record: any) => record.student_no && record.full_name)
      .map((record: any) => ({
        id: String(record.id),
        studentId: record.student_no,
        name: record.full_name,
        course: record.course ?? '',
        section: record.section ?? '',
        date: record.date,
        timeIn: this.formatTime(record.time_in),
        timeOut: this.formatTime(record.time_out),
        courseSection: `${record.course ?? ''} - Section ${record.section ?? ''}`,
      }));
  }

  loadAttendance(): void {
    this.loading = true;

    const params = {
      student_no: '000001',
    };

    this.gateAttendanceService
      .getGateMonitoring(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('API response:', res);

          const data = Array.isArray(res?.data) ? res.data : [];
          this.attendanceRecords = this.mapRecords(data);
          this.originalRecords = [...this.attendanceRecords];
          this.totalRecords = this.attendanceRecords.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading attendance:', err);

          if (err?.status === 401) {
            console.warn('Unauthorized request. Possible missing token during SSR or expired token.');
          }

          this.attendanceRecords = [];
          this.originalRecords = [];
          this.totalRecords = 0;
          this.cdr.detectChanges();
        },
      });
  }

  loadAttendancePage(page: number): void {
    this.loading = true;

    const params = {
      page,
      per_page: this.rows,
      student_no: '000001',
    };

    this.gateAttendanceService
      .getGateMonitoring(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const data = Array.isArray(res?.data) ? res.data : [];
          this.attendanceRecords = this.mapRecords(data);
          this.originalRecords = [...this.attendanceRecords];
          this.totalRecords = res?.total ?? this.attendanceRecords.length;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading attendance page:', err);
          this.cdr.detectChanges();
        },
      });
  }

  onPageChanged(event: PageChangedEvent): void {
    this.rows = event.perPage;
    this.first = event.first;

    const page = Math.floor(this.first / this.rows) + 1;
    this.loadAttendancePage(page);
  }

  onRowClicked(row: AttendanceRecord): void {
    console.log('Row clicked:', row);
  }

  filterData(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.attendanceRecords = this.originalRecords.filter((record) =>
      record.studentId.toLowerCase().includes(term) ||
      record.name.toLowerCase().includes(term) ||
      record.course.toLowerCase().includes(term) ||
      record.section.toLowerCase().includes(term)
    );

    this.totalRecords = this.attendanceRecords.length;
  }
}