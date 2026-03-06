import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';

interface StatCard {
  value: string;
  label: string;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'purple' | 'orange';
}

interface QuickAction {
  label: string;
  icon: string;
  action: string;
  route: string;
}

interface Activity {
  time: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent {
  private router = inject(Router);
  constructor(private toast: ToastService) {}

  totalStudents = 3240;
  attendanceToday = 2981;

  get attendancePercent(): number {
    if (!this.totalStudents) return 0;
    return Math.round((this.attendanceToday / this.totalStudents) * 100);
  }

  // ✅ ONLY 3 STAT CARDS
  get stats(): StatCard[] {
    return [
      {
        value: this.totalStudents.toLocaleString(),
        label: 'Total Students',
        icon: 'fas fa-users',
        color: 'blue',
      },
      { value: '18', label: 'Active Announcements', icon: 'fas fa-bullhorn', color: 'purple' },
      {
        value: `${this.attendancePercent}%`,
        label: 'Attendance Percentage',
        icon: 'fas fa-calendar-check',
        color: 'green',
      },
    ];
  }

  // ✅ ONLY 2 QUICK ACTIONS
  quickActions: QuickAction[] = [
    {
      label: 'Gate Attendance',
      icon: 'fas fa-calendar-check',
      action: 'attendance',
      route: '/ats/admin/gate-attendance',
    },
    {
      label: 'Announcements',
      icon: 'fas fa-bullhorn',
      action: 'announcements',
      route: '/general/announcements',
    },
  ];

  // ✅ FACE RECOGNITION ONLY
  activities: Activity[] = [
    {
      time: '08:15 AM',
      text: 'Face Recognition attendance recorded for Jane Smith',
      icon: 'fas fa-camera',
    },
    {
      time: '08:22 AM',
      text: 'Face Recognition attendance recorded for Mark Dela Cruz',
      icon: 'fas fa-camera',
    },
    {
      time: '08:41 AM',
      text: 'Face Recognition attendance recorded for Angela Reyes',
      icon: 'fas fa-camera',
    },
    {
      time: '09:03 AM',
      text: 'Face Recognition attendance recorded for John Santos',
      icon: 'fas fa-camera',
    },
  ];

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }

  handleStatClick(stat: StatCard): void {
    this.toast.info('Stats', `Viewing details for: ${stat.label} (${stat.value})`);
  }
}
