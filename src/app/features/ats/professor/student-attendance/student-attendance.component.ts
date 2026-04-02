import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  ActionEvent,
  DataTableComponent,
  PageChangedEvent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { ProfessorService } from '../../../../services/ats/professor/professor.service';
import {
  ProfessorAttendanceRecord,
  ProfessorSchedule,
  ProfessorSubject,
} from '../../../../models/ats/professor/professor.model';

interface AttendanceTableRow {
  id: number;
  studentId: number;
  name: string;
  section: string;
  subject: string;
  date: string;
  timeIn: string;
  timeOut: string;
  status: string;
  raw: ProfessorAttendanceRecord;
}

interface FilterOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-gate-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './student-attendance.component.html',
})
export class ProfessorStudentAttendanceComponent implements OnInit {
  private professorService = inject(ProfessorService);
  private cdr = inject(ChangeDetectorRef);

  attendanceRecords: AttendanceTableRow[] = [];

  columns: TableColumn<AttendanceTableRow>[] = [];
  actions: RowAction<AttendanceTableRow>[] = [];

  rows = 10;
  first = 0;
  totalRecords = 0;
  loading = false;

  selectedSubjectId: number | '' = '';
  selectedSectionId: number | '' = '';

  subjectOptions: FilterOption[] = [];
  sectionOptions: FilterOption[] = [];

  subjects: ProfessorSubject[] = [];
  schedules: ProfessorSchedule[] = [];

  ngOnInit(): void {
    this.initializeColumns();
    this.initializeActions();
    this.loadInitialData();
  }

  initializeColumns(): void {
    this.columns = [
      {
        field: 'name',
        header: 'Name',
        sortable: true,
      },
      {
        field: 'section',
        header: 'Section',
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
        sortable: true,
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

  loadInitialData(): void {
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      subjects: this.professorService.getMySubjects(),
      schedules: this.professorService.getMySchedules(),
      attendance: this.professorService.getAttendanceRecords(1, this.rows, null, null),
    }).subscribe({
      next: ({ subjects, schedules, attendance }) => {
        this.subjects = subjects.data ?? [];
        this.schedules = schedules.data ?? [];

        this.buildFilterOptions();
        this.setAttendanceData(attendance);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load initial attendance data:', error);
        this.attendanceRecords = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadAttendanceRecords(page: number = 1): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.professorService
      .getAttendanceRecords(
        page,
        this.rows,
        this.selectedSubjectId || null,
        this.selectedSectionId || null
      )
      .subscribe({
        next: (response) => {
          this.setAttendanceData(response);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load professor attendance records:', error);
          this.attendanceRecords = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private setAttendanceData(response: any): void {
    const records: ProfessorAttendanceRecord[] = response.data ?? [];

    this.attendanceRecords = records.map((record) => ({
      id: record.id,
      studentId: record.student?.id ?? 0,
      name: record.student?.name ?? 'N/A',
      section: record.student?.section?.section_name ?? 'N/A',
      subject: record.schedule?.subject?.subject_name ?? 'N/A',
      date: this.extractDate(record.created_at),
      timeIn: record.time_in ?? '-',
      timeOut: record.time_out ?? '-',
      status: this.formatStatus(record.status),
      raw: record,
    }));

    this.totalRecords = response.pagination?.total ?? 0;
    this.first =
      ((response.pagination?.current_page ?? 1) - 1) *
      (response.pagination?.per_page ?? this.rows);
  }

  private buildFilterOptions(): void {
    this.subjectOptions = [
      { label: 'All Subjects', value: '' },
      ...this.subjects.map((subject) => ({
        label: subject.subject_name ?? subject.subject_code ?? 'Unknown Subject',
        value: subject.id,
      })),
    ];

    const uniqueSections = Array.from(
      new Map(
        this.schedules
          .filter((item) => item.section?.id)
          .map((item) => [
            item.section!.id,
            {
              label: item.section!.section_name,
              value: item.section!.id,
            },
          ])
      ).values()
    );

    this.sectionOptions = [
      { label: 'All Sections', value: '' },
      ...uniqueSections,
    ];
  }

  onFilterChange(): void {
    this.first = 0;
    this.loadAttendanceRecords(1);
  }

  clearFilters(): void {
    this.selectedSubjectId = '';
    this.selectedSectionId = '';
    this.first = 0;
    this.loadAttendanceRecords(1);
  }

  extractDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    return value.includes(' ') ? value.split(' ')[0] : value;
  }

  formatStatus(status: string): string {
    const value = (status || '').toLowerCase();

    if (value === 'present') return 'Present';
    if (value === 'late') return 'Late';
    if (value === 'absent') return 'Absent';

    return status || 'N/A';
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

  onActionClicked(event: ActionEvent<AttendanceTableRow>): void {
    const { actionKey, row } = event;

    let newStatus: 'Present' | 'Late' | 'Absent';

    if (actionKey === 'present') {
      newStatus = 'Present';
    } else if (actionKey === 'late') {
      newStatus = 'Late';
    } else {
      newStatus = 'Absent';
    }

    const oldStatus = row.status;
    row.status = newStatus;
    this.attendanceRecords = [...this.attendanceRecords];
    this.cdr.detectChanges();

    this.professorService.updateAttendanceStatus(row.id, newStatus).subscribe({
      next: () => {
        console.log('Attendance updated successfully:', row.id, newStatus);
      },
      error: (error) => {
        console.error('Failed to update attendance status:', error);
        row.status = oldStatus;
        this.attendanceRecords = [...this.attendanceRecords];
        this.cdr.detectChanges();
      },
    });
  }

  onRowClicked(row: AttendanceTableRow): void {
    console.log('Row clicked:', row);
  }

  onPageChanged(event: PageChangedEvent): void {
    this.rows = event.perPage;
    this.first = event.first;

    const page = Math.floor(event.first / event.perPage) + 1;
    this.loadAttendanceRecords(page);
  }
}