import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';

import { ParentStudentService } from '../../../../services/gps/parent/parent-student.service';
import {
  ParentChild,
  ParentChildSchedule,
} from '../../../../models/gps/parent/parent.model';

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
  term: string;
}

@Component({
  selector: 'app-child-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './childs-schedule.component.html',
})
export class ChildScheduleComponent implements OnInit, OnDestroy {
  private parentStudentService = inject(ParentStudentService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  selectedClass: ChildClassBlock | null = null;
  isModalOpen = false;

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
  termOptions: SelectOption[] = [{ label: 'All Terms', value: 'All Terms' }];

  students: StudentOption[] = [];

  selectedStudent = '';
  selectedTerm = 'All Terms';

  classes: ChildClassBlock[] = [];

  ngOnInit(): void {
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
    return student ? `${student.course} • ${student.details}` : 'No details available';
  }

  loadChildren(): void {
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
            details: `${child.year_level ?? 'No year'} • ${child.section?.section_name ?? 'No section'}`,
          }));

          this.studentOptions = this.students.map((student) => ({
            label: `${student.name} - ${student.course}`,
            value: student.id,
          }));

          this.selectedStudent = this.students.length ? this.students[0].id : '';
          this.cdr.detectChanges();

          if (this.selectedStudent) {
            setTimeout(() => {
              this.loadSchedule();
            }, 0);
          }
        },
        error: (err) => {
          console.error('Failed to load children:', err);
          this.students = [];
          this.studentOptions = [];
          this.classes = [];
          this.cdr.detectChanges();
        },
      });
  }

  onStudentChange(value: string): void {
    this.selectedStudent = String(value ?? '').trim();
    this.selectedTerm = 'All Terms';
    this.loadSchedule();
  }

  onTermChange(value: string): void {
    this.selectedTerm = String(value ?? 'All Terms');
    this.cdr.detectChanges();
  }

  loadSchedule(): void {
    if (!this.selectedStudent) {
      this.classes = [];
      this.termOptions = [{ label: 'All Terms', value: 'All Terms' }];
      this.selectedTerm = 'All Terms';
      this.cdr.detectChanges();
      return;
    }

    this.parentStudentService
      .getChildSchedules(Number(this.selectedStudent))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const schedules: ParentChildSchedule[] = response?.data ?? [];

          this.classes = schedules.map((schedule) => {
            const academicYear = schedule.academic_year;
            const termLabel = academicYear
              ? `${academicYear.academic_year ?? ''} ${academicYear.semester ?? ''}`.trim()
              : 'Unassigned Term';

            return {
              code:
                schedule.subject?.subject_code ||
                schedule.course_code ||
                'N/A',
              name: schedule.subject?.subject_name ?? 'Untitled Subject',
              section:
                schedule.section?.section_name ?? 'No section',
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
              term: termLabel,
            };
          });

          const uniqueTerms = Array.from(
            new Set(this.classes.map((item) => item.term))
          );

          this.termOptions = [
            { label: 'All Terms', value: 'All Terms' },
            ...uniqueTerms.map((term) => ({
              label: term,
              value: term,
            })),
          ];

          if (
            this.selectedTerm !== 'All Terms' &&
            !uniqueTerms.includes(this.selectedTerm)
          ) {
            this.selectedTerm = 'All Terms';
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load schedule:', err);
          this.classes = [];
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

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${modifier}`;
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
    return this.classes.filter((item) => {
      const sameStudent = item.studentId === this.selectedStudent;
      const sameTerm =
        this.selectedTerm === 'All Terms' || item.term === this.selectedTerm;
      return sameStudent && sameTerm;
    });
  }

  getClassesForDay(day: string): ChildClassBlock[] {
    return this.getFilteredClasses().filter((item) => item.days.includes(day));
  }

  openDetails(classInfo: ChildClassBlock, event?: Event): void {
    event?.stopPropagation();
    this.selectedClass = { ...classInfo };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(event?: Event): void {
    event?.stopPropagation();
    this.isModalOpen = false;
    this.selectedClass = null;
    this.cdr.detectChanges();
  }
}