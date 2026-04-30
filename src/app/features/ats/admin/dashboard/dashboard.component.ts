import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastService } from '../../../../shared/services/toast.service';
import { StudentService } from '../../../../services/admin-panel/user-management/student/student.service';
import { GateAttendanceService } from '../../../../services/ats/gate-attendance/gate-attendance.service';
import { AnnouncementService } from '../../../../services/general/announcement.service';

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
export class AdminDashboardComponent implements OnInit {
  private router = inject(Router);
  private studentService = inject(StudentService);
  private gateAttendanceService = inject(GateAttendanceService);
  private announcementService = inject(AnnouncementService);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private toast: ToastService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  loading = false;

  totalStudents = 0;
  attendanceToday = 0;
  activeAnnouncements = 0;

  activities: Activity[] = [];

  get attendancePercent(): number {
    if (!this.totalStudents) return 0;

    const percentage = Math.round((this.attendanceToday / this.totalStudents) * 100);

    return Math.min(percentage, 100);
  }

  get stats(): StatCard[] {
    return [
      {
        value: this.totalStudents.toLocaleString(),
        label: 'Total Students',
        icon: 'pi pi-users',
        color: 'blue',
      },
      {
        value: this.activeAnnouncements.toLocaleString(),
        label: 'Active Announcements',
        icon: 'pi pi-megaphone',
        color: 'purple',
      },
      {
        value: `${this.attendancePercent}%`,
        label: 'Attendance Percentage',
        icon: 'pi pi-calendar-plus',
        color: 'green',
      },
    ];
  }

  quickActions: QuickAction[] = [
    {
      label: 'Gate Attendance',
      icon: 'pi pi-calendar-plus',
      action: 'attendance',
      route: '/ats/admin/gate-attendance',
    },
    {
      label: 'Announcements',
      icon: 'pi pi-megaphone',
      action: 'announcements',
      route: '/general/announcements',
    },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      students: this.studentService.getStudent(1, 1).pipe(
        catchError((err) => {
          console.error('Failed to load total students:', err);
          return of(null);
        }),
      ),

      announcements: this.announcementService.getAnnouncement(1, 1000).pipe(
        catchError((err) => {
          console.error('Failed to load active announcements:', err);
          return of(null);
        }),
      ),

      attendance: this.gateAttendanceService.getGateMonitoring().pipe(
        catchError((err) => {
          console.error('Failed to load gate attendance:', err);
          return of(null);
        }),
      ),
    }).subscribe({
      next: ({ students, announcements, attendance }) => {
        this.totalStudents = this.extractTotal(students);
        this.activeAnnouncements = this.extractActiveAnnouncementsCount(announcements);

        const attendanceData = this.extractDataArray(attendance);

        this.attendanceToday = this.countTodayAttendance(attendanceData);
        this.activities = this.mapLatestAttendanceActivities(attendanceData);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);

        this.loading = false;
        this.cdr.detectChanges();

        if (err?.status !== 401) {
          this.toast.error('Error', 'Failed to load dashboard data.');
        }
      },
    });
  }

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }

  handleStatClick(stat: StatCard): void {
    this.toast.info('Stats', `Viewing details for: ${stat.label} (${stat.value})`);
  }

  private extractTotal(response: any): number {
    if (!response) return 0;

    if (typeof response?.pagination?.total === 'number') {
      return response.pagination.total;
    }

    if (typeof response?.total === 'number') {
      return response.total;
    }

    if (Array.isArray(response?.data)) {
      return response.data.length;
    }

    if (Array.isArray(response)) {
      return response.length;
    }

    return 0;
  }

  private extractDataArray(response: any): any[] {
    if (!response) return [];

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response)) {
      return response;
    }

    return [];
  }

  private extractActiveAnnouncementsCount(response: any): number {
    const data = this.extractDataArray(response);

    return data.filter((item: any) => {
      const status = String(item?.status ?? '').toLowerCase();
      return status === 'active';
    }).length;
  }

  private countTodayAttendance(records: any[]): number {
    const uniqueStudents = new Set<string>();

    records.forEach((record) => {
      const studentNo = String(record?.student_no ?? '').trim();

      if (!studentNo) return;
      if (!this.isToday(record?.date)) return;

      uniqueStudents.add(studentNo);
    });

    return uniqueStudents.size;
  }

  private mapLatestAttendanceActivities(records: any[]): Activity[] {
    return records
      .filter((record: any) => record?.full_name && (record?.time_in || record?.created_at))
      .sort((a: any, b: any) => {
        return this.getRecordTimestamp(b) - this.getRecordTimestamp(a);
      })
      .slice(0, 10)
      .map((record: any) => {
        const name = record?.full_name ?? 'Unknown Student';
        const time = this.formatAttendanceTime(record);

        return {
          time,
          text: `Face Recognition attendance recorded for ${name}`,
          icon: 'pi pi-camera',
        };
      });
  }

  private getRecordTimestamp(record: any): number {
    const date = record?.date ?? '';
    const time = record?.time_in ?? record?.created_at ?? '';

    const dateTime = `${date} ${time}`;
    const parsed = new Date(dateTime).getTime();

    if (!Number.isNaN(parsed)) {
      return parsed;
    }

    if (record?.created_at) {
      const createdAt = new Date(record.created_at).getTime();
      return Number.isNaN(createdAt) ? 0 : createdAt;
    }

    return 0;
  }

  private isToday(dateValue: any): boolean {
    if (!dateValue) return false;

    const recordDate = new Date(dateValue);
    if (Number.isNaN(recordDate.getTime())) return false;

    const today = new Date();

    return (
      recordDate.getFullYear() === today.getFullYear() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getDate() === today.getDate()
    );
  }

  private formatAttendanceTime(record: any): string {
    const time = record?.time_in ?? record?.created_at;

    if (!time || time === '-') {
      return '-';
    }

    /**
     * Handles HH:mm:ss or HH:mm format from API.
     */
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(String(time))) {
      const [hours = 0, minutes = 0, seconds = 0] = String(time).split(':').map(Number);

      const date = new Date();
      date.setHours(hours, minutes, seconds, 0);

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    /**
     * Handles created_at/date-time format.
     */
    const parsed = new Date(time);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    return String(time);
  }
}
