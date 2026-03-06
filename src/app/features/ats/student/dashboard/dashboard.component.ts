import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

interface TodayClass {
  subject: string;
  room: string;
  professor: string;
  time: string;
  status: 'present' | 'upcoming' | 'absent' | 'late';
}

type StatItem = {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'yellow' | 'green';
};

interface QuickAction {
  label: string;
  icon: string;
  action: string;
  route: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './dashboard.component.html',
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  todayDate: string = '';
  private updateTimer: any;

  stats: StatItem[] = [
    { label: 'Total Classes', value: '8', icon: 'pi pi-book', color: 'blue' },
    { label: 'Gate Attendance Status', value: 'Present', icon: 'pi pi-check', color: 'green' },
    { label: 'Upcoming Classes', value: '3', icon: 'pi pi-clock', color: 'yellow' },
  ];

  // ✅ Removed "Reports"
  quickActions: QuickAction[] = [
    { label: 'Gate Attendance', icon: 'pi pi-sign-in', action: 'gate', route: '' },
    { label: 'Subject Attendance', icon: 'pi pi-book', action: 'subject', route: '' },
    { label: 'Schedule', icon: 'pi pi-list', action: 'schedule', route: '' },
  ];

  classes: TodayClass[] = [
    {
      subject: 'Mathematics',
      room: 'Room 204',
      professor: 'Prof. Santos',
      time: '8:00 AM - 9:30 AM',
      status: 'present',
    },
    {
      subject: 'Science',
      room: 'Room 305',
      professor: 'Dr. Rodriguez',
      time: '10:00 AM - 11:30 AM',
      status: 'present',
    },
    {
      subject: 'Programming',
      room: 'Lab 102',
      professor: 'Prof. Lee',
      time: '1:00 PM - 2:30 PM',
      status: 'upcoming',
    },
  ];

  ngOnInit() {
    this.todayDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  ngOnDestroy() {
    if (this.updateTimer) clearInterval(this.updateTimer);
  }

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }
}
