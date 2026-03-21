import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ParentStudentService } from '../../../../services/gps/parent/parent-student.service';
import {
  ParentChild,
  ParentChildSchedule,
} from '../../../../models/gps/parent/parent.model';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'yellow';
}

interface QuickAction {
  label: string;
  icon: string;
  action: string;
  route: string;
}

interface TodayClass {
  time: string;
  course: string;
  section: string;
  professor: string;
}

interface Student {
  id: string;
  name: string;
  course: string;
  avatar: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private parentStudentService = inject(ParentStudentService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  selectedStudent = '';
  students: Student[] = [];
  todayClasses: TodayClass[] = [];

  loadingChildren = false;
  loadingClasses = false;
  errorMessage = '';

  stats: Stat[] = [
    {
      label: 'Classes Today',
      value: '0',
      icon: 'pi pi-clock',
      color: 'purple',
    },
  ];

  quickActions: QuickAction[] = [
    {
      label: "Child's Grades",
      icon: 'pi pi-star',
      action: 'viewGrades',
      route: '/gps/parent/childs-grade',
    },
    {
      label: 'Class Schedule',
      icon: 'pi pi-clock',
      action: 'viewSchedule',
      route: '/gps/parent/childs-schedule',
    },
    {
      label: 'Announcements',
      icon: 'pi pi-megaphone',
      action: 'viewAnnouncements',
      route: '/general/announcements',
    },
  ];

  ngOnInit(): void {
    this.initDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initDashboard(): void {
    this.errorMessage = '';
    this.loadingChildren = true;
    this.loadingClasses = false;

    this.parentStudentService
      .getMyChildren()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const children: ParentChild[] = response?.data ?? [];

          this.students = children.map((child) => ({
            id: String(child.id),
            name: child.full_name,
            course: this.buildStudentSubtitle(child),
            avatar: this.getInitials(child.full_name),
          }));

          if (!this.students.length) {
            this.selectedStudent = '';
            this.todayClasses = [];
            this.updateStats();
            this.loadingChildren = false;
            this.cdr.detectChanges();
            return;
          }

          this.selectedStudent = String(this.students[0].id);

          this.loadingChildren = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.loadTodayClasses(Number(this.selectedStudent));
          }, 0);
        },
        error: (err) => {
          console.error('Failed to load children:', err);
          this.errorMessage =
            err?.error?.message || 'Failed to load student list.';
          this.students = [];
          this.selectedStudent = '';
          this.todayClasses = [];
          this.updateStats();
          this.loadingChildren = false;
          this.cdr.detectChanges();
        },
      });
  }

  onStudentChange(value: string): void {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) return;

    this.selectedStudent = normalizedValue;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.loadTodayClasses(Number(normalizedValue));
    }, 0);
  }

  loadTodayClasses(studentId: number): void {
    if (!studentId) {
      this.todayClasses = [];
      this.updateStats();
      return;
    }

    this.loadingClasses = true;
    this.errorMessage = '';

    this.parentStudentService
      .getChildSchedules(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const schedules: ParentChildSchedule[] = response?.data ?? [];
          const todayName = this.getTodayName().toLowerCase();

          this.todayClasses = schedules
            .filter(
              (schedule) =>
                String(schedule.day ?? '').trim().toLowerCase() === todayName
            )
            .map((schedule) => ({
              time: `${this.formatTime(schedule.start_time)} - ${this.formatTime(
                schedule.end_time
              )}`,
              course:
                schedule.subject?.subject_code && schedule.subject?.subject_name
                  ? `${schedule.subject.subject_code} - ${schedule.subject.subject_name}`
                  : schedule.subject?.subject_name ||
                    schedule.subject?.subject_code ||
                    'Untitled Subject',
              section:
                schedule.section?.section_name ||
                schedule.room ||
                'No section/room',
              professor:
                schedule.professor?.full_name || 'No professor assigned',
            }));

          this.updateStats();
          this.loadingClasses = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load today classes:', err);
          this.errorMessage =
            err?.error?.message || 'Failed to load today classes.';
          this.todayClasses = [];
          this.updateStats();
          this.loadingClasses = false;
          this.cdr.detectChanges();
        },
      });
  }

  get selectedStudentData(): Student | undefined {
    return this.students.find(
      (student) => String(student.id) === String(this.selectedStudent)
    );
  }

  get todayDateLabel(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getTodayName(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  buildStudentSubtitle(child: ParentChild): string {
    const courseName = child.course?.course_name ?? 'No course';
    const yearLevel = child.year_level ?? 'No year';

    return `${courseName} - ${yearLevel}`;
  }

  formatTime(value: string): string {
    if (!value) return '';

    const parts = value.split(':');
    if (parts.length < 2) return value;

    let hour = Number(parts[0]);
    const minute = parts[1];
    const suffix = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${suffix}`;
  }

  updateStats(): void {
    this.stats = [
      {
        label: 'Classes Today',
        value: String(this.todayClasses.length),
        icon: 'pi pi-clock',
        color: 'purple',
      },
    ];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }

  trackByStudentId(index: number, student: Student): string {
    return student.id;
  }

  trackByClass(index: number, item: TodayClass): string {
    return `${item.time}-${item.course}-${item.section}`;
  }

  getNavItemClass(active: boolean): string {
    const baseClass = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all';
    if (active) {
      return `${baseClass} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`;
    }
    return `${baseClass} text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50`;
  }
}