import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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
}

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.component.html',
})
export class StudentScheduleComponent {
  selectedSubject: SubjectSchedule | null = null;
  isModalOpen = false;

  readonly days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  readonly schedules: SubjectSchedule[] = [
    {
      code: 'CC101',
      subject: 'Introduction to Computing',
      section: 'BSIT 2A',
      room: 'Room 301',
      instructor: 'Prof. Santos',
      time: '08:30 AM - 10:00 AM',
      startTime: '08:30 AM',
      endTime: '10:00 AM',
      days: ['Monday', 'Wednesday'],
    },
    {
      code: 'CC102',
      subject: 'Computer Programming 2',
      section: 'BSIT 2A',
      room: 'Lab 204',
      instructor: 'Prof. Reyes',
      time: '10:30 AM - 12:00 PM',
      startTime: '10:30 AM',
      endTime: '12:00 PM',
      days: ['Monday', 'Thursday'],
    },
    {
      code: 'GEED01',
      subject: 'Understanding the Self',
      section: 'BSIT 2A',
      room: 'Room 105',
      instructor: 'Prof. Cruz',
      time: '01:00 PM - 02:30 PM',
      startTime: '01:00 PM',
      endTime: '02:30 PM',
      days: ['Tuesday'],
    },
    {
      code: 'MATH203',
      subject: 'Discrete Mathematics',
      section: 'BSIT 2A',
      room: 'Room 210',
      instructor: 'Prof. Dela Cruz',
      time: '08:30 AM - 11:30 AM',
      startTime: '08:30 AM',
      endTime: '11:30 AM',
      days: ['Friday'],
    },
    {
      code: 'PE101',
      subject: 'Physical Education',
      section: 'BSIT 2A',
      room: 'Gymnasium',
      instructor: 'Prof. Mendoza',
      time: '03:00 PM - 05:00 PM',
      startTime: '03:00 PM',
      endTime: '05:00 PM',
      days: ['Wednesday'],
    },
    {
      code: 'NSTP1',
      subject: 'National Service Training Program',
      section: 'BSIT 2A',
      room: 'AVR 1',
      instructor: 'Prof. Garcia',
      time: '09:00 AM - 12:00 PM',
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      days: ['Saturday'],
    },
  ];

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