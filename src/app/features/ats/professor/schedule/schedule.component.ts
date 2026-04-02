import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ProfessorService } from '../../../../services/ats/professor/professor.service';
import { ProfessorSchedule } from '../../../../models/ats/professor/professor.model';

interface ClassBlock {
  id: number;
  code: string;
  name: string;
  section: string;
  room: string;
  students: number;
  time: string;
  startTime: string;
  endTime: string;
  days: string[];
}

@Component({
  selector: 'app-prof-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
})
export class ProfessorScheduleComponent implements OnInit {
  private professorService = inject(ProfessorService);
  private cdr = inject(ChangeDetectorRef);

  selectedClass: ClassBlock | null = null;
  isLoading = false;

  academicYearLabel = '';
  semesterLabel = '';

  readonly days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  classes: ClassBlock[] = [];

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.professorService.getMySchedules().subscribe({
      next: (response) => {
        const schedules: ProfessorSchedule[] = response?.data ?? [];

        this.classes = this.mapSchedulesToClassBlocks(schedules);

        this.academicYearLabel = schedules[0]?.academic_year?.academic_year ?? '';
        this.semesterLabel = schedules[0]?.academic_year?.semester ?? '';

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load professor schedules:', error);
        this.classes = [];
        this.academicYearLabel = '';
        this.semesterLabel = '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapSchedulesToClassBlocks(items: ProfessorSchedule[]): ClassBlock[] {
    return items.map((item) => {
      const startTime = this.mysqlTimeTo12Hour(item.start_time);
      const endTime = this.mysqlTimeTo12Hour(item.end_time);

      return {
        id: item.id,
        code: item.subject?.subject_code ?? item.course_code ?? 'N/A',
        name: item.subject?.subject_name ?? item.subject?.subject_code ?? 'Untitled Subject',
        section: `${item.course_code ?? ''}${item.section?.section_name ? ' - ' + item.section.section_name : ''}`,
        room: item.room ?? 'No room',
        students: 0,
        time: `${startTime} - ${endTime}`,
        startTime,
        endTime,
        days: item.day ? [this.normalizeDay(item.day)] : [],
      };
    });
  }

  private mysqlTimeTo12Hour(time: string): string {
    if (!time) return '';

    const [hourStr, minuteStr] = time.split(':');
    let hours = Number(hourStr);
    const minutes = Number(minuteStr);
    const suffix = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  }

  private normalizeDay(day: string): string {
    const value = (day || '').trim().toLowerCase();

    const dayMap: Record<string, string> = {
      mon: 'Monday',
      monday: 'Monday',
      tue: 'Tuesday',
      tues: 'Tuesday',
      tuesday: 'Tuesday',
      wed: 'Wednesday',
      wednesday: 'Wednesday',
      thu: 'Thursday',
      thur: 'Thursday',
      thurs: 'Thursday',
      thursday: 'Thursday',
      fri: 'Friday',
      friday: 'Friday',
      sat: 'Saturday',
      saturday: 'Saturday',
      sun: 'Sunday',
      sunday: 'Sunday',
    };

    return dayMap[value] || day;
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

  isHourLabel(slot: string): boolean {
    return slot.endsWith(':00 AM') || slot.endsWith(':00 PM');
  }

  getDayColumn(day: string): number {
    return this.days.indexOf(day) + 2;
  }

  getRowStart(classItem: ClassBlock): number {
    const index = this.timeSlots.indexOf(classItem.startTime);
    return index >= 0 ? index + 2 : 2;
  }

  getRowSpan(classItem: ClassBlock): number {
    const start = this.toMinutes(classItem.startTime);
    const end = this.toMinutes(classItem.endTime);
    return Math.max(1, Math.round((end - start) / 30));
  }

  getClassesForDay(day: string): ClassBlock[] {
    return this.classes.filter((item) => item.days.includes(day));
  }

  openDetails(classInfo: ClassBlock, event?: Event): void {
    event?.stopPropagation();
    this.selectedClass = { ...classInfo };
    this.cdr.detectChanges();
  }
}