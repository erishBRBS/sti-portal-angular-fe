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
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';

import { ParentStudentService } from '../../../../services/gps/parent/parent-student.service';
import {
  ParentChild,
  ParentChildSchedule,
} from '../../../../models/gps/parent/parent.model';
import { AcademicYearService } from '../../../../services/admin-panel/curriculum-management/academic-year.service';
import { AcademicYearData } from '../../../../models/admin-panel/curriculum-management/academic-year.model';

interface SelectOption {
  label: string;
  value: string;
}

interface StudentOption {
  id: string;
  name: string;
  course: string;
  details: string;
}

interface AcademicPeriod {
  id: number;
  academic_year: string;
  semester: string;
}

interface ChildClassBlock {
  code: string;
  name: string;
  section: string;
  room: string;
  professor: string;
  time: string;
  startTime: string;
  endTime: string;
  days: string[];
  studentId: string;
}

@Component({
  selector: 'app-child-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './childs-schedule.component.html',
})
export class ChildScheduleComponent implements OnInit, OnDestroy {
  private parentStudentService = inject(ParentStudentService);
  private academicYearService = inject(AcademicYearService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  selectedClass: ChildClassBlock | null = null;
  isModalOpen = false;

  loadingStudents = false;
  loadingSchedule = false;
  errorMessage = '';

  readonly days: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  studentOptions: SelectOption[] = [];
  academicYearOptions: SelectOption[] = [];
  semesterOptions: SelectOption[] = [];

  students: StudentOption[] = [];
  academicPeriods: AcademicPeriod[] = [];

  selectedStudent = '';
  selectedAcademicYear = '';
  selectedSemester = '';
  selectedAcademicYearId: number | null = null;

  classes: ChildClassBlock[] = [];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadChildren();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedStudentData(): StudentOption | undefined {
    return this.students.find(
      (student) => String(student.id) === String(this.selectedStudent)
    );
  }

  get selectedStudentName(): string {
    return this.selectedStudentData?.name ?? 'Student';
  }

  get selectedStudentDetails(): string {
    const student = this.selectedStudentData;
    return student ? student.details : 'No details available';
  }

  loadChildren(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadingStudents = true;
    this.errorMessage = '';

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
            details: `${child.course?.course_name ?? 'No course'} ${child.year_level ?? 'No year'}`,
          }));

          this.studentOptions = this.students.map((student) => ({
            label: student.name,
            value: student.id,
          }));

          this.selectedStudent = this.students.length ? this.students[0].id : '';
          this.loadingStudents = false;
          this.cdr.detectChanges();

          this.loadAcademicPeriods();
        },
        error: (err) => {
          console.error('Failed to load children:', err);
          this.errorMessage = err?.error?.message || 'Failed to load students.';
          this.students = [];
          this.studentOptions = [];
          this.classes = [];
          this.loadingStudents = false;
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
          const periods: AcademicYearData[] = response?.data ?? [];

          this.academicPeriods = periods.map((item) => ({
            id: Number(item.id),
            academic_year: item.academic_year,
            semester: item.semester,
          }));

          const uniqueAcademicYears = Array.from(
            new Set(this.academicPeriods.map((item) => item.academic_year))
          );

          this.academicYearOptions = uniqueAcademicYears.map((year) => ({
            label: year,
            value: year,
          }));

          this.selectedAcademicYear = this.academicYearOptions.length
            ? this.academicYearOptions[0].value
            : '';

          this.buildSemesterOptions();
          this.cdr.detectChanges();

          if (this.selectedStudent && this.selectedAcademicYearId) {
            setTimeout(() => {
              this.loadSchedule();
            }, 0);
          }
        },
        error: (err) => {
          console.error('Failed to load academic periods:', err);
          this.errorMessage =
            err?.error?.message || 'Failed to load academic periods.';
          this.academicPeriods = [];
          this.academicYearOptions = [];
          this.semesterOptions = [];
          this.selectedAcademicYear = '';
          this.selectedSemester = '';
          this.selectedAcademicYearId = null;
          this.classes = [];
          this.cdr.detectChanges();
        },
      });
  }

  onStudentChange(value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.selectedStudent = String(value ?? '').trim();

    if (!this.selectedStudent || !this.selectedAcademicYearId) {
      this.classes = [];
      this.cdr.detectChanges();
      return;
    }

    this.loadSchedule();
  }

  onAcademicYearChange(value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.selectedAcademicYear = String(value ?? '').trim();
    this.buildSemesterOptions();
    this.loadSchedule();
  }

  onSemesterChange(value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.selectedSemester = String(value ?? '').trim();
    this.resolveSelectedAcademicYearId();
    this.loadSchedule();
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

  loadSchedule(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.selectedStudent || !this.selectedAcademicYearId) {
      this.classes = [];
      this.cdr.detectChanges();
      return;
    }

    this.loadingSchedule = true;
    this.errorMessage = '';

    this.parentStudentService
      .getChildSchedules(
        Number(this.selectedStudent),
        this.selectedAcademicYearId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const schedules: ParentChildSchedule[] = response?.data ?? [];

          this.classes = schedules.map((schedule) => ({
            code:
              schedule.subject?.subject_code ||
              schedule.course_code ||
              'N/A',
            name: schedule.subject?.subject_name ?? 'Untitled Subject',
            section: schedule.section?.section_name ?? 'No section',
            room: schedule.room ?? 'No room',
            professor:
              schedule.professor?.professor_name ||
              schedule.professor?.full_name ||
              'No professor assigned',
            time: `${this.formatTime(schedule.start_time)} - ${this.formatTime(schedule.end_time)}`,
            startTime: this.formatTime(schedule.start_time),
            endTime: this.formatTime(schedule.end_time),
            days: [schedule.day],
            studentId: String(this.selectedStudent),
          }));

          this.loadingSchedule = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load schedule:', err);
          this.errorMessage = err?.error?.message || 'Failed to load schedule.';
          this.classes = [];
          this.loadingSchedule = false;
          this.cdr.detectChanges();
        },
      });
  }

  getStudentInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
    const slots: string[] = [];
    let current = this.toMinutes(start);
    const endMinutes = this.toMinutes(end);

    while (current < endMinutes) {
      slots.push(this.toTimeString(current));
      current += intervalMinutes;
    }

    return slots;
  }

  private toMinutes(time: string): number {
    const [clock, modifier] = time.split(' ');
    let [hours, minutes] = clock.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  private toTimeString(totalMinutes: number): string {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const modifier = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${modifier}`;
  }

  formatTime(value: string): string {
    if (!value) return '';

    const [hourStr, minuteStr] = value.split(':');
    let hour = Number(hourStr);
    const minute = minuteStr ?? '00';
    const suffix = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour.toString().padStart(2, '0')}:${minute} ${suffix}`;
  }

  isHourLabel(slot: string): boolean {
    return slot.endsWith(':00 AM') || slot.endsWith(':00 PM');
  }

  getDayColumn(day: string): number {
    return this.days.indexOf(day) + 2;
  }

  getRowStart(classItem: ChildClassBlock): number {
    return this.timeSlots.indexOf(classItem.startTime) + 2;
  }

  getRowSpan(classItem: ChildClassBlock): number {
    const start = this.toMinutes(classItem.startTime);
    const end = this.toMinutes(classItem.endTime);
    return Math.max(1, (end - start) / 30);
  }

  getFilteredClasses(): ChildClassBlock[] {
    return this.classes.filter((item) => item.studentId === this.selectedStudent);
  }

  getClassesForDay(day: string): ChildClassBlock[] {
    return this.getFilteredClasses().filter((item) => item.days.includes(day));
  }

  openDetails(classInfo: ChildClassBlock, event?: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;

    event?.stopPropagation();
    this.selectedClass = { ...classInfo };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(event?: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;

    event?.stopPropagation();
    this.isModalOpen = false;
    this.selectedClass = null;
    this.cdr.detectChanges();
  }
}