import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  PageChangedEvent,
} from '../../../../shared/components/data-table/data-table.component';

interface AttendanceRecord {
  id: string;
  studentId: string;
  name: string;
  course: string;
  section: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: string;
  courseSection?: string;
}

@Component({
  selector: 'app-gate-attendance',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './gate-attendance.component.html',
})
export class GateAttendanceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  columns: TableColumn<AttendanceRecord>[] = [];

  rows = 12;
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
      {
        field: 'status',
        header: 'Status',
        type: 'tag',
        sortable: true,
        tagLabel: (row) => row.status,
        tagSeverity: (row) => this.getStatusSeverity(row.status),
        tagClass: (row) => this.getStatusClass(row.status),
      },
    ];
  }

  loadSampleData(): void {
    const records: AttendanceRecord[] = [
      {
        id: 'ATT001',
        studentId: '2025-001',
        name: 'John Michael Doe',
        course: 'BSIT',
        section: 'A',
        date: '2023-09-11',
        timeIn: '08:00',
        timeOut: '17:00',
        status: 'Present',
      },
      {
        id: 'ATT002',
        studentId: '2025-002',
        name: 'Jane Marie Smith',
        course: 'BSED',
        section: 'B',
        date: '2023-09-11',
        timeIn: '08:15',
        timeOut: '17:00',
        status: 'Late',
      },
      {
        id: 'ATT003',
        studentId: '2025-003',
        name: 'Robert James Johnson',
        course: 'BSCS',
        section: 'C',
        date: '2023-09-11',
        timeIn: '-',
        timeOut: '-',
        status: 'Absent',
      },
      {
        id: 'ATT004',
        studentId: '2025-004',
        name: 'Maria Santos Garcia',
        course: 'BSBA',
        section: 'A',
        date: '2023-09-10',
        timeIn: '08:05',
        timeOut: '17:00',
        status: 'Present',
      },
      {
        id: 'ATT005',
        studentId: '2025-005',
        name: 'Carlos David Reyes',
        course: 'BSIT',
        section: 'B',
        date: '2023-09-10',
        timeIn: '08:20',
        timeOut: '17:00',
        status: 'Late',
      },
      {
        id: 'ATT006',
        studentId: '2025-006',
        name: 'Sarah Lynn Tan',
        course: 'BSED',
        section: 'C',
        date: '2023-09-09',
        timeIn: '08:00',
        timeOut: '17:00',
        status: 'Present',
      },
      {
        id: 'ATT007',
        studentId: '2025-007',
        name: 'Michael Anthony Cruz',
        course: 'BSCS',
        section: 'A',
        date: '2023-09-09',
        timeIn: '08:00',
        timeOut: '17:00',
        status: 'Present',
      },
      {
        id: 'ATT008',
        studentId: '2025-008',
        name: 'Andrea Nicole Lim',
        course: 'BSBA',
        section: 'B',
        date: '2023-09-08',
        timeIn: '-',
        timeOut: '-',
        status: 'Absent',
      },
      {
        id: 'ATT009',
        studentId: '2025-009',
        name: 'Daniel Patrick Ong',
        course: 'BSIT',
        section: 'C',
        date: '2023-09-08',
        timeIn: '08:10',
        timeOut: '17:00',
        status: 'Present',
      },
      {
        id: 'ATT010',
        studentId: '2025-010',
        name: 'Christine Ann Torres',
        course: 'BSED',
        section: 'A',
        date: '2023-09-07',
        timeIn: '08:25',
        timeOut: '17:00',
        status: 'Late',
      },
    ];

    this.attendanceRecords = records.map((record) => ({
      ...record,
      courseSection: `${record.course} - Section ${record.section}`,
    }));

    this.totalRecords = this.attendanceRecords.length;
  }

  getStatusSeverity(
    status: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status.toLowerCase()) {
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
  getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
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

  onRowClicked(row: AttendanceRecord): void {
    console.log('Row clicked:', row);
  }

  onPageChanged(event: PageChangedEvent): void {
    this.rows = event.perPage;
    this.first = event.first;
  }
}
