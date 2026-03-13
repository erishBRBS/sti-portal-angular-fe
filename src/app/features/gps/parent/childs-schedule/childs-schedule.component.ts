import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

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
export class ChildScheduleComponent {
  selectedClass: ChildClassBlock | null = null;
  isModalOpen = false;

  readonly days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly timeSlots: string[] = this.generateTimeSlots('07:00 AM', '07:00 PM', 30);

  studentOptions: SelectOption[] = [
    { label: 'Hadassa Yap - BS Information Technology', value: 'student-1' },
    { label: 'John Cruz - BS Computer Science', value: 'student-2' },
  ];

  termOptions: SelectOption[] = [
    { label: 'A.Y. 2025-2026 | 1st Semester', value: '2025-2026-1' },
    { label: 'A.Y. 2025-2026 | 2nd Semester', value: '2025-2026-2' },
  ];

  students: StudentOption[] = [
    {
      id: 'student-1',
      name: 'Hadassa Yap',
      course: 'BS Information Technology',
      details: '3rd Year • Section A',
    },
    {
      id: 'student-2',
      name: 'John Cruz',
      course: 'BS Computer Science',
      details: '2nd Year • Section B',
    },
  ];

  selectedStudent = 'student-1';
  selectedTerm = '2025-2026-2';

  readonly classes: ChildClassBlock[] = [
    {
      code: 'WEB101',
      name: 'Web Development',
      section: 'BSIT 3A',
      room: 'Room 301',
      professor: 'E. Enerlan',
      time: '08:30 AM - 10:00 AM',
      startTime: '08:30 AM',
      endTime: '10:00 AM',
      days: ['Monday', 'Wednesday'],
      studentId: 'student-1',
      term: '2025-2026-2',
    },
    {
      code: 'IAS201',
      name: 'Information Assurance & Security',
      section: 'BSIT 3A',
      room: 'Room 205',
      professor: 'J. Guevarra',
      time: '10:00 AM - 11:30 AM',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      days: ['Tuesday', 'Thursday'],
      studentId: 'student-1',
      term: '2025-2026-2',
    },
    {
      code: 'CAP301',
      name: 'IT Capstone Project 1',
      section: 'BSIT 3A',
      room: 'Lab 102',
      professor: 'R. Camposagrado',
      time: '01:00 PM - 03:00 PM',
      startTime: '01:00 PM',
      endTime: '03:00 PM',
      days: ['Friday'],
      studentId: 'student-1',
      term: '2025-2026-2',
    },
    {
      code: 'GBK101',
      name: 'Great Books',
      section: 'BSIT 3A',
      room: 'Room 402',
      professor: 'L. Manalaysay',
      time: '03:00 PM - 04:30 PM',
      startTime: '03:00 PM',
      endTime: '04:30 PM',
      days: ['Saturday'],
      studentId: 'student-1',
      term: '2025-2026-2',
    },
    {
      code: 'CS201',
      name: 'Data Structures',
      section: 'BSCS 2B',
      room: 'Room 210',
      professor: 'A. Reyes',
      time: '08:00 AM - 09:30 AM',
      startTime: '08:00 AM',
      endTime: '09:30 AM',
      days: ['Monday', 'Wednesday'],
      studentId: 'student-2',
      term: '2025-2026-2',
    },
    {
      code: 'SE202',
      name: 'Software Engineering',
      section: 'BSCS 2B',
      room: 'Lab 201',
      professor: 'M. Santos',
      time: '01:00 PM - 03:00 PM',
      startTime: '01:00 PM',
      endTime: '03:00 PM',
      days: ['Tuesday', 'Thursday'],
      studentId: 'student-2',
      term: '2025-2026-2',
    },
  ];

  get selectedStudentData(): StudentOption | undefined {
    return this.students.find((student) => student.id === this.selectedStudent);
  }

  get selectedStudentName(): string {
    return this.selectedStudentData?.name ?? 'Student';
  }

  get selectedStudentDetails(): string {
    const student = this.selectedStudentData;
    return student ? `${student.course} • ${student.details}` : 'No details available';
  }

  onStudentChange(value: string): void {
    this.selectedStudent = value;
  }

  onTermChange(value: string): void {
    this.selectedTerm = value;
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
    return this.classes.filter(
      (item) => item.studentId === this.selectedStudent && item.term === this.selectedTerm
    );
  }

  getClassesForDay(day: string): ChildClassBlock[] {
    return this.getFilteredClasses().filter((item) => item.days.includes(day));
  }

  openDetails(classInfo: ChildClassBlock, event?: Event): void {
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