import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

import { StudentService } from '../../../../services/ats/student/student.service';
import { StudentScheduleItem } from '../../../../models/ats/student/student.model';

interface SubjectSchedule {
  code: string;
  subject: string;
  section: string;
  room: string;
  instructor: string;
  time: string;
  startTime: string;
  endTime: string;
  days: string[];
  academicYear: string;
  semester: string;
}

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
})
export class StudentScheduleComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private studentService = inject(StudentService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  selectedSubject: SubjectSchedule | null = null;

  readonly days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  schedules: SubjectSchedule[] = [];
  loadingSchedules = false;

  academicYearLabel = '';
  semesterLabel = '';

  ngOnInit(): void {
    this.loadMySchedules();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (event.urlAfterRedirects.includes('/ats/student/schedule')) {
          this.loadMySchedules();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMySchedules(): void {
    this.loadingSchedules = true;
    this.cdr.detectChanges();

    this.studentService
      .getMySchedules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const rows: StudentScheduleItem[] = response?.data ?? [];

          this.schedules = rows.map((item) => ({
            code: item.subject?.subject_code || item.course_code || 'N/A',
            subject: item.subject?.subject_name || item.subject?.subject_code || 'Untitled Subject',
            section: item.section?.section_name ?? 'No section',
            room: item.room ?? 'No room',
            instructor:
              item.professor?.professor_name ||
              item.professor?.full_name ||
              'No instructor assigned',
            time: `${this.formatTime(item.start_time)} - ${this.formatTime(item.end_time)}`,
            startTime: this.formatTime(item.start_time),
            endTime: this.formatTime(item.end_time),
            days: item.day ? [item.day] : [],
            academicYear: item.academic_year?.academic_year ?? '',
            semester: item.academic_year?.semester ?? '',
          }));

          this.academicYearLabel = rows[0]?.academic_year?.academic_year ?? '';
          this.semesterLabel = rows[0]?.academic_year?.semester ?? '';
          this.loadingSchedules = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load student schedules:', err);
          this.schedules = [];
          this.academicYearLabel = '';
          this.semesterLabel = '';
          this.loadingSchedules = false;
          this.cdr.detectChanges();
        },
      });
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

  private formatTime(value: string): string {
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

  getRowStart(schedule: SubjectSchedule): number {
    const index = this.timeSlots.indexOf(schedule.startTime);
    return index >= 0 ? index + 2 : 2;
  }

  getRowSpan(schedule: SubjectSchedule): number {
    const start = this.toMinutes(schedule.startTime);
    const end = this.toMinutes(schedule.endTime);
    return Math.max(1, Math.round((end - start) / 30));
  }

  getSchedulesForDay(day: string): SubjectSchedule[] {
    return this.schedules.filter((item) => item.days.includes(day));
  }

  openDetails(subjectInfo: SubjectSchedule, event?: Event): void {
    event?.stopPropagation();
    this.selectedSubject = { ...subjectInfo };
    this.cdr.detectChanges();
  }
}