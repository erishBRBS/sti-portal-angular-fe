import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NavigationEnd, Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, filter, takeUntil } from 'rxjs';

import { StudentService } from '../../../../services/ats/student/student.service';
import { StudentScheduleItem } from '../../../../models/ats/student/student.model';

interface TodayClass {
  subject: string;
  room: string;
  professor: string;
  time: string;
  status: 'Present' | 'Upcoming' | 'Absent' | 'Late';
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
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  private router = inject(Router);
  private studentService = inject(StudentService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  todayDate = '';
  loadingSchedules = false;

  stats: StatItem[] = [
    { label: 'Total Classes', value: '0', icon: 'pi pi-book', color: 'blue' },
    { label: 'Gate Attendance Status', value: 'Present', icon: 'pi pi-check', color: 'green' },
    { label: 'Upcoming Classes', value: '0', icon: 'pi pi-clock', color: 'yellow' },
  ];

  quickActions: QuickAction[] = [
    { label: 'Gate Attendance', icon: 'pi pi-sign-in', action: 'gate', route: '/ats/student/gate-attendance' },
    { label: 'Subject Attendance', icon: 'pi pi-book', action: 'subject', route: '/ats/student/subject-attendance' },
    { label: 'Schedule', icon: 'pi pi-list', action: 'schedule', route: '/ats/student/schedule' },
  ];

  classes: TodayClass[] = [];

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.setTodayDate();
    this.loadMySchedules();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (event.urlAfterRedirects.includes('/ats/student/dashboard')) {
          this.setTodayDate();
          this.loadMySchedules();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleQuickAction(action: QuickAction): void {
    if (!this.isBrowser) return;

    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }

  private setTodayDate(): void {
    if (!this.isBrowser) return;

    this.todayDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private loadMySchedules(): void {
    if (!this.isBrowser) return;

    this.loadingSchedules = true;
    this.cdr.detectChanges();

    this.studentService
      .getMySchedules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const schedules = response?.data ?? [];
          this.classes = this.mapTodayClasses(schedules);
          this.updateStats(schedules);
          this.loadingSchedules = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load student schedules:', err);
          this.classes = [];
          this.updateStats([]);
          this.loadingSchedules = false;
          this.cdr.detectChanges();
        },
      });
  }

  private mapTodayClasses(schedules: StudentScheduleItem[]): TodayClass[] {
    const todayName = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    }).toLowerCase();

    const nowMinutes = this.currentMinutes();

    return schedules
      .filter((item) => String(item.day ?? '').trim().toLowerCase() === todayName)
      .map((item) => {
        const start = this.timeToMinutes(item.start_time);
        const end = this.timeToMinutes(item.end_time);

        let status: TodayClass['status'] = 'Upcoming';

        if (nowMinutes >= start && nowMinutes <= end) {
          status = 'Present';
        } else if (nowMinutes > end) {
          status = 'Absent';
        }

        return {
          subject:
            item.subject?.subject_name ||
            item.subject?.subject_code ||
            item.course_code ||
            'Untitled Subject',
          room: item.room ?? 'No room',
          professor:
            item.professor?.professor_name ||
            item.professor?.full_name ||
            'No professor assigned',
          time: `${this.formatTime(item.start_time)} - ${this.formatTime(item.end_time)}`,
          status,
        };
      });
  }

  private updateStats(schedules: StudentScheduleItem[]): void {
    const todayName = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
    }).toLowerCase();

    const todaySchedules = schedules.filter(
      (item) => String(item.day ?? '').trim().toLowerCase() === todayName
    );

    const nowMinutes = this.currentMinutes();

    const upcomingCount = todaySchedules.filter(
      (item) => this.timeToMinutes(item.start_time) > nowMinutes
    ).length;

    this.stats = [
      {
        label: 'Total Classes',
        value: String(todaySchedules.length),
        icon: 'pi pi-book',
        color: 'blue',
      },
      {
        label: 'Gate Attendance Status',
        value: 'Present',
        icon: 'pi pi-check',
        color: 'green',
      },
      {
        label: 'Upcoming Classes',
        value: String(upcomingCount),
        icon: 'pi pi-clock',
        color: 'yellow',
      },
    ];
  }

  private formatTime(value: string): string {
    if (!value) return '';

    const [hourStr, minuteStr] = value.split(':');
    let hour = Number(hourStr);
    const minute = minuteStr ?? '00';
    const suffix = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${suffix}`;
  }

  private timeToMinutes(value: string): number {
    const [hourStr, minuteStr] = value.split(':');
    const hour = Number(hourStr || 0);
    const minute = Number(minuteStr || 0);
    return hour * 60 + minute;
  }

  private currentMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
}