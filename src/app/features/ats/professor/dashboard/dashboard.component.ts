import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface TodayClass {
  subject: string;
  section: string;
  room: string;
  time: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface Announcement {
  title: string;
  meta: string;
  content: string;
}

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styles: [
    `
      .animate-fadeIn {
        animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
        background: transparent !important;
        border-color: #1e293b !important;
      }
    `,
  ],
})
export class ProfessorDashboardComponent implements OnInit {
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  todaysClasses: TodayClass[] = [
    {
      subject: 'Mathematics',
      section: 'BSIT 2A',
      room: 'Room 204',
      time: '8:00 AM - 9:30 AM',
      status: 'completed',
    },
    {
      subject: 'Science',
      section: 'BSIT 3B',
      room: 'Room 305',
      time: '10:00 AM - 11:30 AM',
      status: 'in-progress',
    },
    {
      subject: 'Programming',
      section: 'BSCS 1C',
      room: 'Lab 102',
      time: '1:00 PM - 2:30 PM',
      status: 'upcoming',
    },
  ];

  announcements: Announcement[] = [
    {
      title: 'General Assembly - September 15',
      meta: 'Posted by Administration • Sep 10, 2023',
      content: 'All faculty members are required to attend.',
    },
    {
      title: 'Class Suspension - Typhoon Alert',
      meta: 'Posted by Administration • Sep 9, 2023',
      content: 'Classes on Sept 18 suspended due to weather.',
    },
    {
      title: 'New Curriculum Guidelines',
      meta: 'Posted by Academic Department • Sep 5, 2023',
      content: 'Please review the updated guidelines.',
    },
  ];

attendanceChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  datasets: [
    { label: 'Present', backgroundColor: '#10B981', borderRadius: 6, data: [45, 43, 47, 46, 44] },
    { label: 'Late', backgroundColor: '#FACC15', borderRadius: 6, data: [3, 4, 2, 5, 3] },
    { label: 'Absent', backgroundColor: '#EF4444', borderRadius: 6, data: [5, 7, 3, 4, 6] },
  ],
};

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', stepSize: 10 } },
    },
  };

  ngOnInit() {
    this.updateClassStatuses();
  }

  getStatusText(status: string) {
    const map: any = { completed: 'Completed', 'in-progress': 'In Progress', upcoming: 'Upcoming' };
    return map[status] || status;
  }

  getStatusSeverity(status: string) {
    const map: any = { completed: 'success', 'in-progress': 'warning', upcoming: 'info' };
    return map[status] || 'info';
  }

  updateClassStatuses() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    this.todaysClasses.forEach((cls) => {
      const [startTime, endTime] = cls.time.split(' - ');
      const start = this.timeToMinutes(startTime);
      const end = this.timeToMinutes(endTime);

      if (currentTime >= start && currentTime <= end) cls.status = 'in-progress';
      else if (currentTime > end) cls.status = 'completed';
      else cls.status = 'upcoming';
    });
  }

  timeToMinutes(timeStr: string) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  onAction(cls: TodayClass) {
    console.log('Action performed for:', cls.subject);
  }
}