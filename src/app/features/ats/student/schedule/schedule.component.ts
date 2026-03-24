import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

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
  private studentScheduleService = inject(StudentService);
  private destroy$ = new Subject<void>();

  selectedSubject: SubjectSchedule | null = null;
  isModalOpen = false;

  readonly days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  schedules: SubjectSchedule[] = [];
  loading = false;

  academicYearLabel = '';
  semesterLabel = '';

  ngOnInit(): void {
    this.loadMySchedules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMySchedules(): void {
    this.loading = true;

    this.studentScheduleService
      .getMySchedules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const rows = response?.data ?? [];

          this.schedules = rows.map((item) => ({
            code:
              item.subject?.subject_code ||
              item.course_code ||
              'N/A',
            subject:
              item.subject?.subject_name ||
              item.subject?.subject_code ||
              'Untitled Subject',
            section: item.section?.section_name ?? 'No section',
            room: item.room ?? 'No room',
            instructor:
              item.professor?.professor_name ||
              item.professor?.full_name ||
              'No instructor assigned',
            time: `${this.formatTime(item.start_time)} - ${this.formatTime(item.end_time)}`,
            startTime: this.formatTime(item.start_time),
            endTime: this.formatTime(item.end_time),
            days: [item.day],
            academicYear: item.academic_year?.academic_year ?? '',
            semester: item.academic_year?.semester ?? '',
          }));

          const first = rows[0];
          this.academicYearLabel = first?.academic_year?.academic_year ?? '';
          this.semesterLabel = first?.academic_year?.semester ?? '';
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load schedules:', err);
          this.schedules = [];
          this.academicYearLabel = '';
          this.semesterLabel = '';
          this.loading = false;
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
    return this.timeSlots.indexOf(schedule.startTime) + 2;
  }

  getRowSpan(schedule: SubjectSchedule): number {
    const start = this.toMinutes(schedule.startTime);
    const end = this.toMinutes(schedule.endTime);
    return Math.max(1, (end - start) / 30);
  }

  getSchedulesForDay(day: string): SubjectSchedule[] {
    return this.schedules.filter((item) => item.days.includes(day));
  }

  openDetails(subjectInfo: SubjectSchedule, event?: Event): void {
    event?.stopPropagation();
    this.selectedSubject = { ...subjectInfo };
    this.isModalOpen = true;
  }

  closeModal(event?: Event): void {
    event?.stopPropagation();
    this.isModalOpen = false;
    this.selectedSubject = null;
  }
}