import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Subject, filter, takeUntil } from 'rxjs';

import { StudentGradeItem } from './../../../../models/gps/student/student.model';
import { StudentGradeService } from './../../../../services/gps/student/student.service';

interface QuickAction {
  label: string;
  icon: string;
  action: string;
  route: string;
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
  templateUrl: './dashboard.component.html',
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private studentGradeService = inject(StudentGradeService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  loadingGrades = false;

  stats = [
    { label: 'GWA', value: 'In Progress', icon: 'pi pi-star', color: 'yellow' },
    // { label: 'Attendance', value: '92%', icon: 'pi pi-chart-line', color: 'yellow' }
  ];

  quickActions: QuickAction[] = [
    { label: 'Grades', icon: 'pi pi-file', action: 'grades', route: '/gps/student/grades' },
    {
      label: 'Schedule',
      icon: 'pi pi-calendar',
      action: 'schedule',
      route: '/ats/student/schedule',
    },
    {
      label: 'Announcements',
      icon: 'pi pi-megaphone',
      action: 'announcements',
      route: '/general/announcements',
    },
  ];

  announcements: Announcement[] = [
    {
      title: 'Midterm Exam Schedule',
      date: 'June 21, 2025',
      content:
        'Please check the posted midterm examination schedule for your assigned room and time.',
    },
    {
      title: 'Class Advisory',
      date: 'June 20, 2025',
      content:
        'Selected afternoon classes will shift to asynchronous mode due to campus maintenance.',
    },
    {
      title: 'Submission Reminder',
      date: 'June 19, 2025',
      content:
        'All pending requirements for Web Systems and Technologies must be submitted before Friday.',
    },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMyGrades();
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        if (
          isPlatformBrowser(this.platformId) &&
          event.urlAfterRedirects.includes('/gps/student/dashboard')
        ) {
          this.loadMyGrades();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }

  private loadMyGrades(): void {
    this.loadingGrades = true;
    this.cdr.detectChanges();

    this.studentGradeService
      .getMyGrades()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Grades API response:', response);

          const rows: StudentGradeItem[] = response?.data ?? [];
          console.log('Rows:', rows);
          console.log(
            'Final averages:',
            rows.map((item) => item.final_average),
          );

          const gwaValue = this.computeGwa(rows);
          console.log('Computed GWA:', gwaValue);

          this.stats = [
            {
              label: 'GWA',
              value: gwaValue,
              icon: 'pi pi-star',
              color: 'yellow',
            },
          ];

          this.loadingGrades = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load student grades:', err);

          this.stats = [
            {
              label: 'GWA',
              value: 'In Progress',
              icon: 'pi pi-star',
              color: 'yellow',
            },
          ];

          this.loadingGrades = false;
          this.cdr.detectChanges();
        },
      });
  }
  private computeGwa(rows: StudentGradeItem[]): string {
    if (!rows.length) {
      return 'In Progress';
    }

    const averages = rows.map((item) => {
      const value = String(item.final_average ?? '').trim();
      const parsed = Number(value);
      return value !== '' && !Number.isNaN(parsed) ? parsed : null;
    });

    const hasIncomplete = averages.some((grade) => grade === null);

    if (hasIncomplete) {
      return 'In Progress';
    }

    const validAverages = averages.filter((grade): grade is number => grade !== null);

    if (!validAverages.length) {
      return 'In Progress';
    }

    const total = validAverages.reduce((sum, grade) => sum + grade, 0);
    const gwa = total / validAverages.length;

    return gwa.toFixed(2);
  }
}
