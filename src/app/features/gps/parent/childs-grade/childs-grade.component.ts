import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { SelectModule } from 'primeng/select';

import {
  DataTableComponent,
  TableColumn,
  StiTagSeverity,
} from '../../../../shared/components/data-table/data-table.component';

import { ParentStudentService } from '../../../../services/gps/parent/parent-student.service';
import {
  ParentChild,
  ParentChildGrade,
} from '../../../../models/gps/parent/parent.model';
import { AcademicYearService } from '../../../../services/admin-panel/curriculum-management/academic-year.service';

interface Student {
  id: string;
  name: string;
  course: string;
  details: string;
}

interface Grade {
  id: string;
  subject: string;
  subjectCode: string;
  professor: string;
  prelim: string;
  midterm: string;
  finals: string;
  finalGrade: string;
  status: 'in-progress' | 'passed' | 'failed' | 'dropped' | 'incomplete';
  schedule?: string;
  room?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

interface AcademicPeriod {
  id: number;
  academic_year: string;
  semester: string;
}

@Component({
  selector: 'app-child-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DataTableComponent],
  templateUrl: './childs-grade.component.html',
})
export class ChildGradeComponent implements OnInit, OnDestroy {
  private parentStudentService = inject(ParentStudentService);
  private academicYearService = inject(AcademicYearService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  students: Student[] = [];
  academicPeriods: AcademicPeriod[] = [];

  selectedStudent = '';
  selectedStudentName = 'Student';
  selectedStudentDetails = 'No details available';

  selectedAcademicYear = '';
  selectedSemester = '';
  selectedAcademicYearId: number | null = null;

  currentGrades: Grade[] = [];

  studentOptions: SelectOption[] = [];
  academicYearOptions: SelectOption[] = [];
  semesterOptions: SelectOption[] = [];

  loading = false;

  currentGradeColumns: TableColumn<Grade>[] = [
    {
      field: 'subject',
      header: 'Subject',
      valueGetter: (row) => `${row.subject} (${row.subjectCode})`,
    },
    {
      field: 'professor',
      header: 'Professor',
    },
    {
      field: 'prelim',
      header: 'Prelim',
      align: 'center',
    },
    {
      field: 'midterm',
      header: 'Midterm',
      align: 'center',
    },
    {
      field: 'finals',
      header: 'Finals',
      align: 'center',
    },
    {
      field: 'finalGrade',
      header: 'Final Grade',
      align: 'center',
      class: 'font-bold text-blue-600 dark:text-blue-400',
    },
    {
      field: 'status',
      header: 'Status',
      type: 'tag',
      align: 'center',
      tagLabel: (row) => this.getStatusLabel(row.status),
      tagSeverity: (row) => this.getStatusSeverity(row.status),
      tagClass: (row) => this.getStatusClass(row.status),
    },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadChildren();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChildren(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading = true;

    this.parentStudentService
      .getMyChildren()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const children: ParentChild[] = response?.data ?? [];

          this.students = children.map((child) => ({
            id: String(child.id),
            name: child.full_name,
            course: child.course?.course_name ?? 'No course',
            details: `${child.year_level ?? 'No year'}`,
          }));

          this.studentOptions = this.students.map((student) => ({
            label: `${student.name}`,
            value: student.id,
          }));

          this.selectedStudent = this.students.length ? this.students[0].id : '';
          this.syncSelectedStudentDisplay();
          this.cdr.detectChanges();

          this.loadAcademicPeriods();
        },
        error: (err) => {
          console.error('Failed to load children:', err);
          this.students = [];
          this.studentOptions = [];
          this.currentGrades = [];
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadAcademicPeriods(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.academicYearService
      .getListAllAcademicYear()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const periods: AcademicPeriod[] = response?.data ?? [];

          this.academicPeriods = periods;

          const uniqueAcademicYears = Array.from(
            new Set(periods.map((item) => item.academic_year))
          );

          this.academicYearOptions = uniqueAcademicYears.map((year) => ({
            label: year,
            value: year,
          }));

          this.selectedAcademicYear = this.academicYearOptions.length
            ? this.academicYearOptions[0].value
            : '';

          this.buildSemesterOptions();

          this.loading = false;
          this.cdr.detectChanges();

          if (this.selectedStudent && this.selectedAcademicYearId) {
            setTimeout(() => {
              this.loadGrades();
            }, 0);
          }
        },
        error: (err) => {
          console.error('Failed to load academic periods:', err);
          this.academicPeriods = [];
          this.academicYearOptions = [];
          this.semesterOptions = [];
          this.selectedAcademicYear = '';
          this.selectedSemester = '';
          this.selectedAcademicYearId = null;
          this.currentGrades = [];
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onStudentChange(studentId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.selectedStudent = String(studentId ?? '').trim();
    this.syncSelectedStudentDisplay();

    if (!this.selectedStudent || !this.selectedAcademicYearId) {
      this.currentGrades = [];
      this.cdr.detectChanges();
      return;
    }

    this.loadGrades();
  }

  onAcademicYearChange(academicYear: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.selectedAcademicYear = String(academicYear ?? '').trim();
    this.buildSemesterOptions();
    this.loadGrades();
  }

  onSemesterChange(semester: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.selectedSemester = String(semester ?? '').trim();
    this.resolveSelectedAcademicYearId();
    this.loadGrades();
  }

  private buildSemesterOptions(): void {
    const semesters = this.academicPeriods
      .filter((item) => item.academic_year === this.selectedAcademicYear)
      .map((item) => item.semester);

    const uniqueSemesters = Array.from(new Set(semesters));

    this.semesterOptions = uniqueSemesters.map((semester) => ({
      label: semester,
      value: semester,
    }));

    this.selectedSemester = this.semesterOptions.length
      ? this.semesterOptions[0].value
      : '';

    this.resolveSelectedAcademicYearId();
    this.cdr.detectChanges();
  }

  private resolveSelectedAcademicYearId(): void {
    const matched = this.academicPeriods.find(
      (item) =>
        item.academic_year === this.selectedAcademicYear &&
        item.semester === this.selectedSemester
    );

    this.selectedAcademicYearId = matched ? matched.id : null;
  }

  private syncSelectedStudentDisplay(): void {
    const student = this.students.find(
      (s) => String(s.id) === String(this.selectedStudent)
    );

    if (student) {
      this.selectedStudentName = student.name;
      this.selectedStudentDetails = `${student.course}  ${student.details}`;
    } else {
      this.selectedStudentName = 'Student';
      this.selectedStudentDetails = 'No details available';
    }
  }

  loadGrades(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.selectedStudent || !this.selectedAcademicYearId) {
      this.currentGrades = [];
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

    this.parentStudentService
      .getChildGrades(
        Number(this.selectedStudent),
        this.selectedAcademicYearId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const grades: ParentChildGrade[] = response?.data ?? [];

          this.currentGrades = grades.map((grade, index) => {
            const subject = grade.schedule?.subject;
            const professor = grade.schedule?.professor;
            const academicYear = grade.schedule?.academic_year;

            return {
              id: String(grade.id ?? index),
              subject: subject?.subject_name ?? 'Untitled Subject',
              subjectCode: subject?.subject_code ?? 'N/A',
              professor:
                professor?.professor_name ||
                professor?.full_name ||
                'No professor assigned',
              prelim: this.displayGrade(grade.prelim_grade),
              midterm: this.displayGrade(grade.midterm_grade),
              finals: this.displayGrade(
                grade.finals_grade ?? grade.final_grade
              ),
              finalGrade: this.displayGrade(
                grade.final_average ?? grade.final_grade
              ),
              status: this.mapGradeStatus(grade.status ?? grade.remarks),
              schedule: academicYear
                ? `${academicYear.academic_year ?? ''} - ${academicYear.semester ?? ''}`.trim()
                : 'N/A',
              room: grade.schedule?.section?.section_name ?? 'N/A',
            };
          });

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load grades:', err);
          this.currentGrades = [];
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private displayGrade(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === ''
      ? '-'
      : String(value);
  }

  private mapGradeStatus(
    status: string | null | undefined
  ): Grade['status'] {
    const normalized = String(status ?? '').trim().toLowerCase();

    if (normalized.includes('pass')) return 'passed';
    if (normalized.includes('fail')) return 'failed';
    if (normalized.includes('drop')) return 'dropped';
    if (normalized.includes('incomplete')) return 'incomplete';
    return 'in-progress';
  }

  getStudentInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getStatusSeverity(status: Grade['status']): StiTagSeverity {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'in-progress':
        return 'warn';
      case 'dropped':
        return 'secondary';
      case 'incomplete':
        return 'contrast';
      default:
        return 'secondary';
    }
  }

  getStatusClass(status: Grade['status']): string {
    switch (status) {
      case 'passed':
        return 'sti-status-success';
      case 'failed':
        return 'sti-status-danger';
      case 'in-progress':
        return 'sti-status-warn';
      case 'dropped':
        return 'sti-status-dropped';
      case 'incomplete':
        return 'sti-status-incomplete';
      default:
        return '';
    }
  }

  getStatusLabel(status: Grade['status']): string {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      case 'dropped':
        return 'Dropped';
      case 'incomplete':
        return 'Incomplete';
      default:
        return status;
    }
  }
}