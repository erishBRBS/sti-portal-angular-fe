import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type AlertItem = {
  title: string;
  desc: string;
  time: string;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
})
export class NotificationComponent {
  alerts: AlertItem[] = [
    {
      title: 'Grade Deadline',
      desc: 'Prelim grading period for BSIT-3A ends tomorrow at 5:00 PM.',
      time: '2h ago',
      icon: 'pi pi-exclamation-circle',
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20',
    },
    {
      title: 'Attendance Alert',
      desc: 'Juan Dela Cruz (BSIT-1B) has been marked absent for 3 consecutive days.',
      time: '5h ago',
      icon: 'pi pi-calendar-times',
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/20',
    },
    {
      title: 'System Update',
      desc: 'The Faculty Portal has been updated to version 2.4. New export features are now available.',
      time: '1d ago',
      icon: 'pi pi-cog',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
    },
  ];

  markAllAsRead() {
    // optional: hook to API / state
    // for now you can clear or flag them
    // this.alerts = this.alerts.map(a => ({ ...a, read: true }))
  }
}