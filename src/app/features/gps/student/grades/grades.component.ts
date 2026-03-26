import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { Subject, takeUntil } from 'rxjs';

import { StiTagSeverity } from '../../../../shared/components/data-table/data-table.component';
import { StudentGradeItem } from './../../../../models/gps/student/student.model';
import { StudentGradeService } from './../../../../services/gps/student/student.service';

interface TermOption {
  label: string;
  value: string;
  academicYear: string;
  semester: string;
}

interface GradeCard {
  subject: string;
  professorName: string;
  date: string;
  prelim?: string;
  midterm?: string;
  preFinals?: string;
  finals?: string;
  average?: string;
  finalGrade?: string;
  status: 'in-progress' | 'passed' | 'failed' | 'dropped' | 'incomplete';
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DialogModule, TagModule],
  templateUrl: './grades.component.html',
})
export class GradeComponent implements OnInit, OnDestroy {
  private studentGradeService = inject(StudentGradeService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  selectedYear = '';
  showGradingSystemModal = false;
  loadingGrades = false;
  academicTermLabel = '';

  years: TermOption[] = [];
  termGpa = 'In Progress';
  gradeCards: GradeCard[] = [];

  gradingSystem = [
    '1.00 (97.5-100%) Excellent',
    '1.25 (94.5-97.49%) Very Good',
    '1.50 (91.5-94.49%) Very Good',
    '1.75 (88.5-91.49%) Very Good',
    '2.00 (85.5-88.49%) Satisfactory',
    '2.25 (81.5-85.49%) Satisfactory',
    '2.50 (77.5-81.49%) Satisfactory',
    '2.75 (73.5-77.49%) Fair',
    '3.00 (69.5-73.49%) Fair',
    '5.00 (Below 69.5%) Failed',
    'DRP (Officially Dropped)',
    'INC (Incomplete Req.)',
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMyGrades();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

private loadMyGrades(): void {
  this.loadingGrades = true;
  this.cdr.detectChanges();

  this.studentGradeService
    .getMyGrades()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        const rows: StudentGradeItem[] = response?.data ?? [];

        const firstRow = rows[0];
        const academicYear = String(firstRow?.schedule?.academic_year?.academic_year ?? '').trim();
        const semester = String(firstRow?.schedule?.academic_year?.semester ?? '').trim();

        this.academicTermLabel =
          academicYear && semester
            ? ` ${academicYear} | ${semester}`
            : academicYear
              ? ` ${academicYear}`
              : semester || 'No term info';

        this.gradeCards = rows.map((item) => this.mapGradeCard(item));
        this.termGpa = this.computeTermGpa(rows);

        this.loadingGrades = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load student grades:', err);
        this.academicTermLabel = 'No term info';
        this.gradeCards = [];
        this.termGpa = 'In Progress';
        this.loadingGrades = false;
        this.cdr.detectChanges();
      },
    });
}

  onAcademicYearChange(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadingGrades = true;
    this.cdr.detectChanges();

    this.studentGradeService
      .getMyGrades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const rows: StudentGradeItem[] = response?.data ?? [];
          this.applyYearFilter(rows, this.selectedYear);
          this.loadingGrades = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to reload student grades:', err);
          this.gradeCards = [];
          this.termGpa = 'In Progress';
          this.loadingGrades = false;
          this.cdr.detectChanges();
        },
      });
  }

  private applyYearFilter(rows: StudentGradeItem[], selectedValue: string): void {
    const selectedOption = this.years.find((item) => item.value === selectedValue);

    const filteredRows = selectedOption
      ? rows.filter((item) => {
          const academicYear = String(
            item.schedule?.academic_year?.academic_year ?? ''
          ).trim();
          const semester = String(
            item.schedule?.academic_year?.semester ?? ''
          ).trim();

          return (
            academicYear === selectedOption.academicYear &&
            semester === selectedOption.semester
          );
        })
      : rows;

    this.gradeCards = filteredRows.map((item) => this.mapGradeCard(item));
    this.termGpa = this.computeTermGpa(filteredRows);
  }

  private buildAcademicYears(rows: StudentGradeItem[]): TermOption[] {
    const uniquePeriods = Array.from(
      new Map(
        rows
          .map((item) => {
            const academicYear = String(
              item.schedule?.academic_year?.academic_year ?? ''
            ).trim();
            const semester = String(
              item.schedule?.academic_year?.semester ?? ''
            ).trim();

            const key = `${academicYear}||${semester}`;

            return [
              key,
              {
                label:
                  academicYear && semester
                    ? `Academic Year ${academicYear} | ${semester}`
                    : academicYear || semester || 'No term info',
                value: key,
                academicYear,
                semester,
              },
            ] as const;
          })
          .filter(([, option]) => option.academicYear || option.semester)
      ).values()
    );

    return uniquePeriods;
  }

  private mapGradeCard(item: StudentGradeItem): GradeCard {
    return {
      subject:
        item.schedule?.subject?.subject_name ||
        item.schedule?.subject?.subject_code ||
        'Unknown Subject',
      professorName:
        item.schedule?.professor?.professor_name ||
        item.schedule?.professor?.full_name ||
        'Unknown Professor',
      date: this.formatAcademicLabel(item),
      prelim: item.prelim_grade ?? '-',
      midterm: item.midterm_grade ?? '-',
      preFinals: item.pre_finals_grade ?? '-',
      finals: item.finals_grade ?? '-',
      average: item.final_average ?? '-',
      finalGrade: item.final_grade ?? '-',
      status: this.normalizeStatus(item),
    };
  }

  private formatAcademicLabel(item: StudentGradeItem): string {
    const academicYear = item.schedule?.academic_year?.academic_year ?? '';
    const semester = item.schedule?.academic_year?.semester ?? '';

    if (academicYear && semester) {
      return `${semester} • ${academicYear}`;
    }

    return academicYear || semester || 'No term info';
  }

  private normalizeStatus(item: StudentGradeItem): GradeCard['status'] {
    const status = String(item.status ?? '').trim().toLowerCase();
    const hasMissingGrade =
      !item.finals_grade ||
      !item.final_average ||
      !item.final_grade ||
      String(item.finals_grade).trim() === '' ||
      String(item.final_average).trim() === '' ||
      String(item.final_grade).trim() === '';

    if (status === 'passed') return 'passed';
    if (status === 'failed') return 'failed';
    if (status === 'dropped') return 'dropped';
    if (status === 'incomplete' || status === 'inc') return 'incomplete';
    if (hasMissingGrade) return 'incomplete';

    return 'in-progress';
  }

  private computeTermGpa(rows: StudentGradeItem[]): string {
    if (!rows.length) {
      return 'In Progress';
    }

    const averages = rows.map((item) => {
      const value = String(item.final_average ?? '').trim();
      const parsed = Number(value);
      return value !== '' && !Number.isNaN(parsed) ? parsed : null;
    });

    const hasIncomplete = averages.some((grade) => grade === null);

    if (hasIncomplete) {
      return 'In Progress';
    }

    const validAverages = averages.filter((grade): grade is number => grade !== null);

    if (!validAverages.length) {
      return 'In Progress';
    }

    const total = validAverages.reduce((sum, grade) => sum + grade, 0);
    return (total / validAverages.length).toFixed(2);
  }

  openGradingSystemModal(): void {
    this.showGradingSystemModal = true;
  }

  getStatusSeverity(status: GradeCard['status']): StiTagSeverity {
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

  getStatusClass(status: GradeCard['status']): string {
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

  getStatusLabel(status: GradeCard['status']): string {
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