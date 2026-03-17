import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ClassBlock {
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
export class ProfessorScheduleComponent {
  selectedClass: ClassBlock | null = null;
  isModalOpen = false;

  readonly days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  readonly classes: ClassBlock[] = [
    {
      code: 'WEB101',
      name: 'Web Development',
      section: 'Section A',
      room: 'Room 301',
      students: 32,
      time: '08:30 AM - 11:30 AM',
      startTime: '08:30 AM',
      endTime: '11:30 AM',
      days: ['Monday', 'Wednesday', 'Friday'],
    },
    {
      code: 'DB201',
      name: 'Database Management',
      section: 'Section B',
      room: 'Room 205',
      students: 28,
      time: '08:30 AM - 10:00 AM',
      startTime: '08:30 AM',
      endTime: '10:00 AM',
      days: ['Tuesday', 'Thursday'],
    },
    {
      code: 'PROG101',
      name: 'Programming Fundamentals',
      section: 'Section C',
      room: 'Room 402',
      students: 30,
      time: '08:30 AM - 10:30 AM',
      startTime: '08:30 AM',
      endTime: '10:30 AM',
      days: ['Saturday'],
    },
    {
      code: 'NET301',
      name: 'Network Administration',
      section: 'Section D',
      room: 'Lab 102',
      students: 25,
      time: '01:00 PM - 03:00 PM',
      startTime: '01:00 PM',
      endTime: '03:00 PM',
      days: ['Tuesday', 'Thursday'],
    },
    {
      code: 'GDEV202',
      name: 'Game Development',
      section: 'Section E',
      room: 'Lab 103',
      students: 22,
      time: '05:00 PM - 07:00 PM',
      startTime: '05:00 PM',
      endTime: '07:00 PM',
      days: ['Friday'],
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

  getRowStart(classItem: ClassBlock): number {
    return this.timeSlots.indexOf(classItem.startTime) + 2;
  }

  getRowSpan(classItem: ClassBlock): number {
    const start = this.toMinutes(classItem.startTime);
    const end = this.toMinutes(classItem.endTime);
    return Math.max(1, (end - start) / 30);
  }

  getClassesForDay(day: string): ClassBlock[] {
    return this.classes.filter((item) => item.days.includes(day));
  }

  openDetails(classInfo: ClassBlock, event?: Event): void {
    event?.stopPropagation();
    this.selectedClass = { ...classInfo };
    this.isModalOpen = true;
  }

  closeModal(event?: Event): void {
    event?.stopPropagation();
    this.isModalOpen = false;
    this.selectedClass = null;
  }
}