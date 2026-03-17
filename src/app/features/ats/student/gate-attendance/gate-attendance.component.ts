import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  StiTagSeverity,
} from '../../../../shared/components/data-table/data-table.component';

interface GateLog {
  date: string;
  day: string;
  timeIn: string;
  timeInMethod: string;
  timeOut: string;
  timeOutMethod: string;
  status: 'complete' | 'in-only' | 'no-entry';
}

@Component({
  selector: 'app-student-gate-attendance',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './gate-attendance.component.html',
})
export class StudentGateAttendanceComponent implements OnInit {
  gateLogs: GateLog[] = [];
  columns: TableColumn<GateLog>[] = [];

  rows = 10;
  first = 0;
  totalRecords = 0;
  loading = false;

  ngOnInit(): void {
    this.initializeColumns();
    this.loadSampleData();
  }

  initializeColumns(): void {
    this.columns = [
      {
        field: 'date',
        header: 'Date',
        type: 'date',
        sortable: true,
        dateFormat: 'MMM d, y',
      },
      {
        field: 'timeIn',
        header: 'In',
      },
      {
        field: 'timeOut',
        header: 'Out',
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

  loadSampleData(): void {
    this.gateLogs = [
      {
        date: '2025-09-11',
        day: 'Thursday',
        timeIn: '07:45 AM',
        timeInMethod: 'Face Recognition',
        timeOut: '03:30 PM',
        timeOutMethod: 'Face Recognition',
        status: 'complete',
      },
      {
        date: '2025-09-10',
        day: 'Wednesday',
        timeIn: '07:50 AM',
        timeInMethod: 'Face Recognition',
        timeOut: '03:35 PM',
        timeOutMethod: 'Face Recognition',
        status: 'complete',
      },
      {
        date: '2025-09-09',
        day: 'Tuesday',
        timeIn: '08:05 AM',
        timeInMethod: 'Face Recognition',
        timeOut: '03:20 PM',
        timeOutMethod: 'Face Recognition',
        status: 'complete',
      },
      {
        date: '2025-09-06',
        day: 'Saturday',
        timeIn: '08:10 AM',
        timeInMethod: 'Face Recognition',
        timeOut: '-',
        timeOutMethod: '-',
        status: 'in-only',
      },
      {
        date: '2025-09-02',
        day: 'Tuesday',
        timeIn: '-',
        timeInMethod: '-',
        timeOut: '-',
        timeOutMethod: '-',
        status: 'no-entry',
      },
    ];

    this.totalRecords = this.gateLogs.length;
  }

  getStatusText(status: GateLog['status']): string {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'in-only':
        return 'Missing Out';
      case 'no-entry':
        return 'No Entry';
      default:
        return 'Unknown';
    }
  }

  getSeverity(status: GateLog['status']): StiTagSeverity {
    switch (status) {
      case 'complete':
        return 'success';
      case 'in-only':
        return 'warn';
      case 'no-entry':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusClass(status: GateLog['status']): string {
    switch (status) {
      case 'complete':
        return 'sti-status-present';
      case 'in-only':
        return 'sti-status-late';
      case 'no-entry':
        return 'sti-status-absent';
      default:
        return '';
    }
  }
}