import { Routes } from '@angular/router';
// import { roleGuard } from '../core/guard/role.guard';

//ADMIN
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { GateAttendanceComponent } from './admin/gate-attendance/gate-attendance.component';

//PROFESSOR
import { ProfessorDashboardComponent } from './professor/dashboard/dashboard.component';
import { ProfessorScheduleComponent } from './professor/schedule/schedule.component';
import { ProfessorStudentAttendanceComponent } from './professor/student-attendance/student-attendance.component';

//STUDENT
import { StudentDashboardComponent } from './student/dashboard/dashboard.component';
import { StudentGateAttendanceComponent } from './student/gate-attendance/gate-attendance.component';
import { StudentSubjectAttendanceComponent } from './student/subject-attendance/subject-attendance.component';
import { StudentScheduleComponent } from './student/schedule/schedule.component';

export const ATS_ROUTES: Routes = [
  //============================================
  // ADMIN ROUTES
  //============================================
  {
    path: 'admin/dashboard',
    // canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    component: AdminDashboardComponent,
  },
  {
    path: 'admin/gate-attendance',
    // canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    component: GateAttendanceComponent,
  },

  //============================================
  // PROFESSOR / TEACHER ROUTES
  //============================================
  {
    path: 'professor/dashboard',
    // canActivate: [roleGuard],
    data: { roles: ['Professor'] },
    component: ProfessorDashboardComponent,
  },
  {
    path: 'professor/student-attendance',
    // canActivate: [roleGuard],
    data: { roles: ['Professor'] },
    component: ProfessorStudentAttendanceComponent,
  },
  {
    path: 'professor/schedule',
    // canActivate: [roleGuard],
    data: { roles: ['Professor'] },
    component: ProfessorScheduleComponent,
  },
  //============================================
  // STUDENT ROUTES
  //============================================
  {
    path: 'student/dashboard',
    // canActivate: [roleGuard],
    data: { roles: ['Student'] },
    component: StudentDashboardComponent,
  },
  {
    path: 'student/gate-attendance',
    // canActivate: [roleGuard],
    data: { roles: ['Student'] },
    component: StudentGateAttendanceComponent,
  },
  {
    path: 'student/subject-attendance',
    // canActivate: [roleGuard],
    data: { roles: ['Student'] },
    component: StudentSubjectAttendanceComponent,
  },
  {
    path: 'student/schedule',
    // canActivate: [roleGuard],
    data: { roles: ['Student'] },
    component: StudentScheduleComponent,
  },

  //============================================
  // DEFAULT
  //============================================
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
