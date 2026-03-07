import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

interface TodayClass {
  subject: string;
  room: string;
  professor: string;
  time: string;
  status: 'present' | 'upcoming' | 'absent' | 'late';
}

interface Announcement {
  title: string;
  date: string;
  content: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './dashboard.component.html'
})
export class StudentDashboardComponent implements OnInit {
  isDarkMode = signal(false);

  stats = [
    { label: 'GWA', value: '2.25', icon: 'pi pi-star', color: 'blue' },
    { label: "Today's Classes", value: '2', icon: 'pi pi-clock', color: 'yellow' },
    { label: 'Attendance', value: '92%', icon: 'pi pi-chart-line', color: 'blue' }
  ];

  quickActions = [
    { label: 'Grades', icon: 'pi pi-file', action: 'grades' },
    { label: 'Schedule', icon: 'pi pi-calendar', action: 'schedule' },
    { label: 'Announcements', icon: 'pi pi-megaphone', action: 'announcements' }
  ];

  classes: TodayClass[] = [
    {
      subject: 'Programming Languages',
      room: 'Room 206',
      professor: 'J. Bernabe',
      time: '10:00 AM - 1:00 PM',
      status: 'present'
    },
    {
      subject: 'Web Systems & Tech',
      room: 'Room 206',
      professor: 'E. Enerlan',
      time: '1:00 PM - 3:00 PM',
      status: 'upcoming'
    }
  ];

  announcements: Announcement[] = [
    {
      title: 'Midterm Exam Schedule',
      date: 'June 21, 2025',
      content: 'Please check the posted midterm examination schedule for your assigned room and time.'
    },
    {
      title: 'Class Advisory',
      date: 'June 20, 2025',
      content: 'Selected afternoon classes will shift to asynchronous mode due to campus maintenance.'
    },
    {
      title: 'Submission Reminder',
      date: 'June 19, 2025',
      content: 'All pending requirements for Web Systems and Technologies must be submitted before Friday.'
    }
  ];

  constructor() {
    effect(() => {
      const theme = localStorage.getItem('theme');
      this.isDarkMode.set(theme === 'dark');
    });
  }

  ngOnInit(): void {
    this.isDarkMode.set(localStorage.getItem('theme') === 'dark');
  }

  handleQuickAction(action: string): void {
    console.log(`Navigating to: ${action}`);
  }
}