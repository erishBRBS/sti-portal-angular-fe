import { Routes } from '@angular/router';
// import { roleGuard } from '../core/guard/role.guard';

//ADMIN
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';

//PROFESSOR
import { ProfessorDashboardComponent } from './professor/dashboard/dashboard.component';
import { GradeManagementComponent } from './professor/grade-management/grade-management.component';

//STUDENT
import { StudentDashboardComponent } from './student/dashboard/dashboard.component';
import { GradeComponent } from './student/grades/grades.component';

//PARENT
import { ParentDashboardComponent } from './parent/dashboard/dashboard.component';

export const GPS_ROUTES: Routes = [
  //============================================
  // ADMIN ROUTES
  //============================================
  {
    path: 'admin/dashboard',
    // canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    component: AdminDashboardComponent,
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
    path: 'professor/grade-management',
    // canActivate: [roleGuard],
    data: { roles: ['Professor'] },
    component: GradeManagementComponent,
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
    path: 'student/grades',
    // canActivate: [roleGuard],
    data: { roles: ['Student'] },
    component: GradeComponent,
  },
  //============================================
  // PARENT ROUTES
  //============================================
  {
    path: 'parent/dashboard',
    // canActivate: [roleGuard],
    data: { roles: ['Parent'] },
    component: ParentDashboardComponent,
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
