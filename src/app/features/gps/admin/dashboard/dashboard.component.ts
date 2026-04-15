import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastService } from '../../../../shared/services/toast.service';

import { StudentService } from '../../../../services/admin-panel/user-management/student/student.service';
import { ParentService } from '../../../../services/admin-panel/user-management/parent/parent.service';
import { ProfessorService } from '../../../../services/admin-panel/user-management/professor/professor.service';
import { CourseService } from '../../../../services/admin-panel/curriculum-management/course.service';

type StatKey =
  | 'totalStudents'
  | 'totalParents'
  | 'totalProfessors'
  | 'totalCourses';

type StatItem = {
  key: StatKey;
  label: string;
  value: number;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'red';
  helper?: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly parentService = inject(ParentService);
  private readonly professorService = inject(ProfessorService);
  private readonly courseService = inject(CourseService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  loading = false;

  private finalStats: Record<StatKey, number> = {
    totalStudents: 0,
    totalParents: 0,
    totalProfessors: 0,
    totalCourses: 0,
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardStats();
    }
  }

  get stats(): StatItem[] {
    return [
      {
        key: 'totalStudents',
        label: 'Total Students',
        value: this.finalStats.totalStudents,
        icon: 'pi pi-users',
        color: 'blue',
        helper: 'Registered students',
      },
      {
        key: 'totalParents',
        label: 'Total Parents',
        value: this.finalStats.totalParents,
        icon: 'pi pi-user',
        color: 'green',
        helper: 'Linked parent accounts',
      },
      {
        key: 'totalProfessors',
        label: 'Total Professors',
        value: this.finalStats.totalProfessors,
        icon: 'pi pi-briefcase',
        color: 'yellow',
        helper: 'Teaching staff',
      },
      {
        key: 'totalCourses',
        label: 'Total Courses',
        value: this.finalStats.totalCourses,
        icon: 'pi pi-book',
        color: 'red',
        helper: 'Courses listed',
      },
    ];
  }

  loadDashboardStats(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      students: this.studentService.getStudent(1, 1).pipe(
        catchError((err) => {
          console.error('Failed to load students total:', err);
          return of(null);
        })
      ),
      parents: this.parentService.getParent(1, 1).pipe(
        catchError((err) => {
          console.error('Failed to load parents total:', err);
          return of(null);
        })
      ),
      professors: this.professorService.getProfessor(1, 1).pipe(
        catchError((err) => {
          console.error('Failed to load professors total:', err);
          return of(null);
        })
      ),
      courses: this.courseService.getCourse(1, 1).pipe(
        catchError((err) => {
          console.error('Failed to load courses total:', err);
          return of(null);
        })
      ),
    }).subscribe({
      next: ({ students, parents, professors, courses }) => {
        this.finalStats.totalStudents = this.extractTotal(students);
        this.finalStats.totalParents = this.extractTotal(parents);
        this.finalStats.totalProfessors = this.extractTotal(professors);
        this.finalStats.totalCourses = this.extractTotal(courses);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this.loading = false;
        this.cdr.detectChanges();

        if (err?.status !== 401) {
          this.toast.error('Error', 'Failed to load dashboard statistics.');
        }
      },
    });
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
}