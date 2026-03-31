import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActionEvent,
  DataTableComponent,
  RowAction,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { GradePortalService } from '../../../../services/gps/professor/professor.service';
import { StudentGradeListItem } from '../../../../models/gps/professor/professor.model';

interface SectionOption {
  id: number;
  name: string;
  label: string;
}

interface SubjectOption {
  id: number;
  code: string;
  name: string;
  label: string;
}

interface StudentGradeRow {
  id: number;
  student_id: number;
  schedule_id: number;
  student_name: string;
  prelim: number | null;
  midterm: number | null;
  pre_finals: number | null;
  finals: number | null;
  final_grade: string;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  section_id: number;
  section_name: string;
  status: string | null;
}

@Component({
  selector: 'app-grade-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './grade-management.component.html',
})
export class GradeManagementComponent implements OnInit {
  private gradePortalService = inject(GradePortalService);
  private cdr = inject(ChangeDetectorRef);

  selectedSubject: number | null = null;
  selectedSection: number | null = null;

  tableRows = 5;
  rowsPerPageOptions = [5, 10, 25, 50];
  tableFirst = 0;
  loading = false;

  subjectOptions: SubjectOption[] = [];
  sectionOptions: SectionOption[] = [];
  allGrades: StudentGradeRow[] = [];

  gradeColumns: TableColumn<StudentGradeRow>[] = [
    {
      field: 'student_name',
      header: 'Student Name',
      sortable: true,
      filter: true,
      width: '24rem',
    },
    {
      field: 'prelim',
      header: 'Prelim',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'midterm',
      header: 'Midterm',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'pre_finals',
      header: 'Pre-Finals',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'finals',
      header: 'Finals',
      sortable: true,
      align: 'center',
      width: '9rem',
    },
    {
      field: 'final_grade',
      header: 'Final Grade',
      sortable: true,
      align: 'center',
      width: '10rem',
    },
  ];

  gradeActions: RowAction<StudentGradeRow>[] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: 'pi pi-pencil',
      tooltip: 'Edit grade',
      buttonClass: 'text-blue-600',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      tooltip: 'Delete record',
      buttonClass: 'text-red-600',
    },
  ];

  ngOnInit(): void {
    this.loadStudentGrades();
  }

  get filteredGrades(): StudentGradeRow[] {
    return this.allGrades.filter((item) => {
      const subjectMatch =
        !this.selectedSubject || item.subject_id === this.selectedSubject;

      const sectionMatch =
        !this.selectedSection || item.section_id === this.selectedSection;

      return subjectMatch && sectionMatch;
    });
  }

  onSubjectChange(value: string): void {
    this.selectedSubject = value ? Number(value) : null;
    this.tableFirst = 0;
    this.cdr.detectChanges();
  }

  onSectionChange(value: string): void {
    this.selectedSection = value ? Number(value) : null;
    this.tableFirst = 0;
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.selectedSubject = null;
    this.selectedSection = null;
    this.tableFirst = 0;
    this.cdr.detectChanges();
  }

  onTableAction(event: ActionEvent<StudentGradeRow>): void {
    if (event.actionKey === 'edit') {
      console.log('Edit row:', event.row);
      return;
    }

    if (event.actionKey === 'delete') {
      console.log('Delete row:', event.row);
    }
  }

  private loadStudentGrades(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.gradePortalService.getStudentGrades().subscribe({
      next: (response) => {
        const rows = (response.data ?? []).map((item) =>
          this.mapGradeRow(item)
        );

        this.allGrades = rows;
        this.subjectOptions = this.buildSubjectOptions(rows);
        this.sectionOptions = this.buildSectionOptions(rows);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load student grades.', error);
        this.allGrades = [];
        this.subjectOptions = [];
        this.sectionOptions = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapGradeRow(item: StudentGradeListItem): StudentGradeRow {
    return {
      id: item.id,
      student_id: item.student?.id ?? 0,
      schedule_id: item.schedule?.id ?? 0,
      student_name: item.student?.full_name ?? 'Unknown Student',
      prelim: this.toNumber(item.prelim_grade),
      midterm: this.toNumber(item.midterm_grade),
      pre_finals: this.toNumber(item.pre_finals_grade),
      finals: this.toNumber(item.finals_grade),
      final_grade:
        item.final_grade !== null &&
        item.final_grade !== undefined &&
        item.final_grade !== ''
          ? String(item.final_grade)
          : '-',
      subject_id: item.schedule?.subject?.id ?? 0,
      subject_code: item.schedule?.subject?.subject_code ?? 'N/A',
      subject_name: item.schedule?.subject?.subject_name ?? 'Unknown Subject',
      section_id: item.schedule?.section?.id ?? 0,
      section_name: item.schedule?.section?.section_name ?? 'N/A',
      status: item.status ?? null,
    };
  }

  private toNumber(value: string | number | null): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  private buildSubjectOptions(rows: StudentGradeRow[]): SubjectOption[] {
    const map = new Map<number, SubjectOption>();

    rows.forEach((row) => {
      if (row.subject_id > 0 && !map.has(row.subject_id)) {
        map.set(row.subject_id, {
          id: row.subject_id,
          code: row.subject_code,
          name: row.subject_name,
          label: `${row.subject_code} - ${row.subject_name}`,
        });
      }
    });

    return Array.from(map.values());
  }

  private buildSectionOptions(rows: StudentGradeRow[]): SectionOption[] {
    const map = new Map<number, SectionOption>();

    rows.forEach((row) => {
      if (row.section_id > 0 && !map.has(row.section_id)) {
        map.set(row.section_id, {
          id: row.section_id,
          name: row.section_name,
          label: row.section_name,
        });
      }
    });

    return Array.from(map.values());
  }
}