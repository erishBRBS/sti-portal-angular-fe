import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, DataTableComponent, FormsModule,],
  templateUrl: './gate-attendance.component.html',
})
export class GateAttendanceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  originalRecords: AttendanceRecord[] = [];
  columns: TableColumn<AttendanceRecord>[] = [];

  constructor(private gateAttendanceService: GateAttendanceService) {}

  rows = 12;
  first = 0;
  totalRecords = 0;
  loading = false;
  searchTerm: string = '';

  

  

  ngOnInit(): void {
    this.initializeColumns();
    this.loadAttendance();
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



loadAttendance(): void {
  this.loading = true;

const params = {
  student_no: '000001'
};

  this.gateAttendanceService.getGateMonitoring(params)
    .subscribe({
      next: (res: any) => {
        console.log('API response:', res);

       const data = Array.isArray(res?.data) ? res.data : [];
          this.attendanceRecords = data
            .filter((record: any) => record.student_no && record.full_name)
            .map((record: any) => ({
              id: record.id,
              studentId: record.student_no,
              name: record.full_name,
              course: record.course,
              section: record.section,
              date: record.date,
              timeIn: this.formatTime(record.time_in),
              timeOut: this.formatTime(record.time_out),
              courseSection: `${record.course} - Section ${record.section}`,
           }));

        this.originalRecords = [...this.attendanceRecords];
        this.totalRecords = data.length;

        setTimeout(() => {
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Error loading attendance:', err);
        this.loading = false;
      }
    });
}
  onRowClicked(row: AttendanceRecord): void {
    console.log('Row clicked:', row);
  }

  loadAttendancePage(page: number): void {
  this.loading = true;

 this.gateAttendanceService.getGateMonitoring()
    .subscribe({
      next: (res: any) => {
        const data = res?.data || [];

          this.attendanceRecords = data.map((record: any) => ({
              id: record.id,
              studentId: record.student_no,
              name: record.full_name,
              course: record.course,
              section: record.section,
              date: record.date,
              timeIn: this.formatTime(record.time_in),
              timeOut: this.formatTime(record.time_out),
              courseSection: `${record.course} - Section ${record.section}`,
           }));

        this.totalRecords = res?.total || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
}

onPageChanged(event: PageChangedEvent): void {
  this.rows = event.perPage;
  this.first = event.first;

  const page = Math.floor(this.first / this.rows) + 1;

  this.loadAttendancePage(page);
}

  filterData(): void {
  const term = this.searchTerm.toLowerCase();

  this.attendanceRecords = this.originalRecords.filter(record =>
    record.studentId.toLowerCase().includes(term) ||
    record.name.toLowerCase().includes(term) ||
    record.course.toLowerCase().includes(term) ||
    record.section.toLowerCase().includes(term)
  );

  this.totalRecords = this.attendanceRecords.length;
}
}
