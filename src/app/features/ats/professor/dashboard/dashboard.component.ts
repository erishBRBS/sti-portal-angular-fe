import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ProfessorService } from '../../../../services/ats/professor/professor.service';
import {
  ProfessorSchedule,
  ProfessorStudent,
  ProfessorSubject,
} from '../../../../models/ats/professor/professor.model';

interface TodayClass {
  subject: string;
  section: string;
  room: string;
  time: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface QuickAction {
  label: string;
  icon: string;
  action: string;
  route: string;
}

interface FilterOption {
  label: string;
  value: string | number | null;
}

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
      :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
        background: transparent !important;
        border-color: #1e293b !important;
      }
    `,
  ],
})
export class ProfessorDashboardComponent implements OnInit {
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private router = inject(Router);
  private professorService = inject(ProfessorService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;

  schedules: ProfessorSchedule[] = [];
  subjects: ProfessorSubject[] = [];
  students: ProfessorStudent[] = [];
  todaysClasses: TodayClass[] = [];

  weeklyClassesCount = 0;
  totalStudentsCount = 0;
  todaysClassesCount = 0;
  todayAttendanceRate = 0;

  selectedSubjectId: number | null = null;
  selectedSectionId: number | null = null;
  selectedCourseCode: string | null = null;

  subjectOptions: FilterOption[] = [];
  sectionOptions: FilterOption[] = [];
  courseOptions: FilterOption[] = [];

  quickActions: QuickAction[] = [
    {
      label: 'Student Attendance',
      icon: 'pi pi-calendar-plus',
      action: 'attendance',
      route: '/ats/professor/student-attendance',
    },
    {
      label: 'Schedule',
      icon: 'pi pi-list',
      action: 'schedule',
      route: '/ats/professor/schedule',
    },
  ];

  attendanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Present',
        backgroundColor: '#10B981',
        borderRadius: 6,
        data: [0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Late',
        backgroundColor: '#FACC15',
        borderRadius: 6,
        data: [0, 0, 0, 0, 0, 0],
      },
      {
        label: 'Absent',
        backgroundColor: '#EF4444',
        borderRadius: 6,
        data: [0, 0, 0, 0, 0, 0],
      },
    ],
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 10,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#94a3b8',
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      schedules: this.professorService.getMySchedules(),
      subjects: this.professorService.getMySubjects(),
      students: this.professorService.getMyStudents(),
      analytics: this.professorService.getAttendanceAnalytics(
        this.selectedSubjectId,
        this.selectedSectionId
      ),
    }).subscribe({
      next: ({ schedules, subjects, students, analytics }) => {
        this.schedules = schedules.data ?? [];
        this.subjects = subjects.data ?? [];
        this.students = students.data ?? [];

        this.buildFilterOptions();

        const filteredSchedules = this.getFilteredSchedules();
        const filteredStudents = this.getFilteredStudents();

        this.weeklyClassesCount = filteredSchedules.length;
        this.totalStudentsCount = filteredStudents.length;

        this.todaysClasses = this.mapTodayClasses(filteredSchedules);
        this.updateClassStatuses();
        this.todaysClassesCount = this.todaysClasses.length;

        this.applyAnalyticsToChart(analytics.data);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load professor dashboard data:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildFilterOptions(): void {
    this.subjectOptions = [
      { label: 'All Subjects', value: null },
      ...this.subjects.map((subject) => ({
        label: subject.subject_name ?? subject.subject_code ?? 'Unknown Subject',
        value: subject.id,
      })),
    ];

    const uniqueSections = Array.from(
      new Map(
        this.schedules
          .filter((item) => item.section?.id)
          .map((item) => [
            item.section.id,
            {
              label: item.section.section_name,
              value: item.section.id,
            },
          ])
      ).values()
    );

    this.sectionOptions = [
      { label: 'All Sections', value: null },
      ...uniqueSections,
    ];

    const uniqueCourses = Array.from(
      new Set(
        this.schedules
          .map((item) => item.course_code)
          .filter((item): item is string => !!item)
      )
    ).sort();

    this.courseOptions = [
      { label: 'All Courses', value: null },
      ...uniqueCourses.map((courseCode) => ({
        label: courseCode,
        value: courseCode,
      })),
    ];
  }

  onAnalyticsFilterChange(): void {
    this.loadAttendanceAnalytics(this.selectedSubjectId, this.selectedSectionId);

    const filteredStudents = this.getFilteredStudents();
    this.totalStudentsCount = filteredStudents.length;

    const filteredSchedules = this.getFilteredSchedules();
    this.weeklyClassesCount = filteredSchedules.length;

    this.todaysClasses = this.mapTodayClasses(filteredSchedules);
    this.updateClassStatuses();
    this.todaysClassesCount = this.todaysClasses.length;

    this.cdr.detectChanges();
  }

  private getFilteredSchedules(): ProfessorSchedule[] {
    return this.schedules.filter((item) => {
      const matchesSubject =
        !this.selectedSubjectId || item.subject?.id === this.selectedSubjectId;

      const matchesSection =
        !this.selectedSectionId || item.section?.id === this.selectedSectionId;

      const matchesCourse =
        !this.selectedCourseCode || item.course_code === this.selectedCourseCode;

      return matchesSubject && matchesSection && matchesCourse;
    });
  }

  private getFilteredStudents(): ProfessorStudent[] {
    return this.students.filter((student) => {
      const matchesSection =
        !this.selectedSectionId || student.section?.id === this.selectedSectionId;

      const matchesCourse =
        !this.selectedCourseCode || student.course_code === this.selectedCourseCode;

      return matchesSection && matchesCourse;
    });
  }

  loadAttendanceAnalytics(subjectId?: number | null, sectionId?: number | null): void {
    this.professorService.getAttendanceAnalytics(subjectId, sectionId).subscribe({
      next: (response) => {
        this.applyAnalyticsToChart(response.data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load attendance analytics:', error);
        this.cdr.detectChanges();
      },
    });
  }

  private applyAnalyticsToChart(analytics: {
    labels: string[];
    present: number[];
    late: number[];
    absent: number[];
  }): void {
    const labels = analytics?.labels ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const present = analytics?.present ?? [0, 0, 0, 0, 0, 0];
    const late = analytics?.late ?? [0, 0, 0, 0, 0, 0];
    const absent = analytics?.absent ?? [0, 0, 0, 0, 0, 0];

    const suggestedMax = this.getSuggestedChartMax(this.totalStudentsCount);
    const stepSize = this.getSuggestedStepSize(suggestedMax);

    this.attendanceChartData = {
      labels: [...labels],
      datasets: [
        {
          label: 'Present',
          backgroundColor: '#10B981',
          borderRadius: 6,
          data: [...present],
        },
        {
          label: 'Late',
          backgroundColor: '#FACC15',
          borderRadius: 6,
          data: [...late],
        },
        {
          label: 'Absent',
          backgroundColor: '#EF4444',
          borderRadius: 6,
          data: [...absent],
        },
      ],
    };

    this.chartOptions = {
      ...this.chartOptions,
      scales: {
        ...this.chartOptions.scales,
        y: {
          ...this.chartOptions.scales.y,
          max: suggestedMax,
          ticks: {
            ...this.chartOptions.scales.y.ticks,
            stepSize,
          },
        },
      },
    };

    const todayIndex = this.getTodayAnalyticsIndex();

    if (todayIndex === -1 || this.todaysClassesCount === 0) {
      this.todayAttendanceRate = 0;
      return;
    }

    const todayPresent = present[todayIndex] ?? 0;
    const todayLate = late[todayIndex] ?? 0;
    const todayAbsent = absent[todayIndex] ?? 0;
    const todayTotal = todayPresent + todayLate + todayAbsent;

    this.todayAttendanceRate =
      todayTotal > 0 ? Math.round(((todayPresent + todayLate) / todayTotal) * 100) : 0;
  }

  private getTodayAnalyticsIndex(): number {
    const day = new Date().getDay();

    switch (day) {
      case 1:
        return 0;
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
      case 5:
        return 4;
      case 6:
        return 5;
      default:
        return -1;
    }
  }

  private getSuggestedChartMax(totalStudents: number): number {
    if (totalStudents <= 0) return 10;
    if (totalStudents <= 10) return 10;
    if (totalStudents <= 25) return 25;
    if (totalStudents <= 50) return 50;
    if (totalStudents <= 100) return 100;

    return Math.ceil(totalStudents / 25) * 25;
  }

  private getSuggestedStepSize(max: number): number {
    if (max <= 10) return 1;
    if (max <= 25) return 5;
    if (max <= 50) return 10;
    if (max <= 100) return 20;

    return 25;
  }

  mapTodayClasses(schedules: ProfessorSchedule[]): TodayClass[] {
    const todayName = this.getTodayName();

    return schedules
      .filter((item) => this.normalizeDay(item.day) === todayName)
      .map((item) => ({
        subject: item.subject?.subject_name || item.subject?.subject_code || 'N/A',
        section: item.section?.section_name
          ? `${item.course_code} - ${item.section.section_name}`
          : item.course_code || 'N/A',
        room: item.room || 'N/A',
        time: `${this.formatTime(item.start_time)} - ${this.formatTime(item.end_time)}`,
        status: 'upcoming',
      }));
  }

  getTodayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  normalizeDay(day: string): string {
    const value = (day || '').trim().toLowerCase();

    const dayMap: Record<string, string> = {
      mon: 'Monday',
      monday: 'Monday',
      tue: 'Tuesday',
      tues: 'Tuesday',
      tuesday: 'Tuesday',
      wed: 'Wednesday',
      wednesday: 'Wednesday',
      thu: 'Thursday',
      thur: 'Thursday',
      thurs: 'Thursday',
      thursday: 'Thursday',
      fri: 'Friday',
      friday: 'Friday',
      sat: 'Saturday',
      saturday: 'Saturday',
      sun: 'Sunday',
      sunday: 'Sunday',
    };

    return dayMap[value] || day;
  }

  formatTime(time: string): string {
    if (!time) return 'N/A';

    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${suffix}`;
  }

  updateClassStatuses(): void {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    this.todaysClasses = this.todaysClasses.map((cls) => {
      const [startTime, endTime] = cls.time.split(' - ');
      const start = this.timeToMinutes(startTime);
      const end = this.timeToMinutes(endTime);

      let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';

      if (currentTime >= start && currentTime <= end) {
        status = 'in-progress';
      } else if (currentTime > end) {
        status = 'completed';
      }

      return { ...cls, status };
    });
  }

  timeToMinutes(timeStr: string): number {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      completed: 'Completed',
      'in-progress': 'In Progress',
      upcoming: 'Upcoming',
    };

    return map[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'info' | 'danger' {
    const map: Record<string, 'success' | 'warn' | 'info' | 'danger'> = {
      completed: 'success',
      'in-progress': 'warn',
      upcoming: 'info',
    };

    return map[status] || 'info';
  }

  handleQuickAction(action: QuickAction): void {
    const url = action.route.startsWith('/') ? action.route : `/${action.route}`;
    this.router.navigateByUrl(url);
  }
}