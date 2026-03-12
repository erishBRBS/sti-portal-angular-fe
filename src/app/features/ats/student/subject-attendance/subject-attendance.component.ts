import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  StiTagSeverity,
} from '../../../../shared/components/data-table/data-table.component';

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
  subjectAttendanceLogs: SubjectAttendanceLog[] = [];
  columns: TableColumn<SubjectAttendanceLog>[] = [];

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
        header: 'In',
        sortable: true,
      },
      {
        field: 'timeOut',
        header: 'Out',
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

  loadSampleData(): void {
    this.subjectAttendanceLogs = [
      {
        subject: 'Programming 1',
        date: '2025-09-11',
        timeIn: '-',
        timeOut: '-',
        status: 'absent',
      },
      {
        subject: 'Database Management',
        date: '2025-09-10',
        timeIn: '-',
        timeOut: '-',
        status: 'absent',
      },
      {
        subject: 'Web Development',
        date: '2025-09-09',
        timeIn: '08:05 AM',
        timeOut: '10:00 AM',
        status: 'late',
      },
      {
        subject: 'Network Administration',
        date: '2025-09-08',
        timeIn: '07:45 AM',
        timeOut: '09:30 AM',
        status: 'present',
      },
      {
        subject: 'Capstone Project 1',
        date: '2025-09-07',
        timeIn: '-',
        timeOut: '-',
        status: 'absent',
      },
    ];

    this.totalRecords = this.subjectAttendanceLogs.length;
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