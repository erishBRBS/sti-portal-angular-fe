import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActionEvent,
  DataTableComponent,
  PageChangedEvent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';

type AttendanceStatus = 'Present' | 'Late' | 'Absent';

interface AttendanceRecord {
  id: string;
  studentId: string;
  name: string;
  course: string;
  section: string;
  subject: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
  courseSection?: string;
}

@Component({
  selector: 'app-gate-attendance',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './student-attendance.component.html',
})
export class ProfessorStudentAttendanceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  columns: TableColumn<AttendanceRecord>[] = [];
  actions: RowAction<AttendanceRecord>[] = [];

  rows = 12;
  first = 0;
  totalRecords = 0;
  loading = false;

  ngOnInit(): void {
    this.initializeColumns();
    this.initializeActions();
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

  initializeActions(): void {
    this.actions = [
      {
        key: 'present',
        label: 'Mark Present',
        icon: 'pi pi-check',
        tooltip: 'Mark as Present',
        buttonClass: 'sti-action-present',
      },
      {
        key: 'late',
        label: 'Mark Late',
        icon: 'pi pi-clock',
        tooltip: 'Mark as Late',
        buttonClass: 'sti-action-late',
      },
      {
        key: 'absent',
        label: 'Mark Absent',
        icon: 'pi pi-times',
        tooltip: 'Mark as Absent',
        buttonClass: 'sti-action-absent',
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
        subject: 'Programming 1',
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
        subject: 'Science 1',
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
        subject: 'Data Structures',
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
        subject: 'Accounting',
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
        subject: 'Database',
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
        subject: 'English',
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
        subject: 'Algorithms',
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
        subject: 'Marketing',
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
        subject: 'Networking',
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
        subject: 'Mathematics',
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

  onActionClicked(event: ActionEvent<AttendanceRecord>): void {
    const { actionKey, row } = event;

    switch (actionKey) {
      case 'present':
        row.status = 'Present';
        break;
      case 'late':
        row.status = 'Late';
        break;
      case 'absent':
        row.status = 'Absent';
        break;
    }

    this.attendanceRecords = [...this.attendanceRecords];
  }

  onRowClicked(row: AttendanceRecord): void {
    console.log('Row clicked:', row);
  }

  onPageChanged(event: PageChangedEvent): void {
    this.rows = event.perPage;
    this.first = event.first;
  }
}