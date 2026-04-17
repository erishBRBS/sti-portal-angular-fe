import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

import { AnnouncementComponent } from './announcement-management/announcement.component';
import { CourseComponent } from './curriculum-management/course/course.component';
import { AcademicYearComponent } from './curriculum-management/academic-year/academic-year.component';
import { ScheduleComponent } from './curriculum-management/schedule/schedule.component';
import { SectionComponent } from './curriculum-management/section/section.component';
import { SubjectComponent } from './curriculum-management/subject/subject.component';
import { GuardianManagementComponent } from './guardian-management/guardian-management';
import { AdminManagementComponent } from './user-management/admin/admin.component';
import { StudentManagementComponent } from './user-management/student/student.component';
import { ProfessorManagementComponent } from './user-management/professor/professor.component';
import { ParentManagementComponent } from './user-management/parent/parent.component';
import { StudentParentComponent } from './association/student-parent/student-parent.component';
import { StudentScheduleComponent } from './association/student-schedule/student-schedule.component';
import { ChangeUserPasswordComponent } from './change-user-password/change-user-password.component';
import { StudentFaceIdComponent } from './association/student-face-id/student-face-id.component';


export const AP_ROUTES: Routes = [
  //ANNOUNCEMENT MANAGEMENT
  {
    path: 'admin/announcement-management',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    component: AnnouncementComponent,
  },
  //Change User Password
  {
    path: 'admin/change-user-password',
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    component: ChangeUserPasswordComponent,
  },
  //CURRICULUM MANAGEMENT
  {
    path: 'admin/curriculum-management/course',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: CourseComponent,
  },
  {
    path: 'admin/curriculum-management/academic',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: AcademicYearComponent,
  },
  {
    path: 'admin/curriculum-management/schedule',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: ScheduleComponent,
  },
  {
    path: 'admin/curriculum-management/section',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: SectionComponent,
  },
  {
    path: 'admin/curriculum-management/subject',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: SubjectComponent,
  },
  //GUARDIAN MANAGEMENT
  {
    path: 'admin/guardian-management',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: GuardianManagementComponent,
  },
  //USER MANAGEMENT
  {
    path: 'admin/user-management/admin',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: AdminManagementComponent,
  },
  {
    path: 'admin/user-management/parent',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: ParentManagementComponent,
  },
  {
    path: 'admin/user-management/professor',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: ProfessorManagementComponent,
  },
  {
    path: 'admin/user-management/student',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: StudentManagementComponent,
  },
  //ASSOCIATION
  {
    path: 'admin/association/student-parent',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: StudentParentComponent,
  },
  {
    path: 'admin/association/student-schedule',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: StudentScheduleComponent,
  },
  {
    path: 'admin/association/student-face-id',
    data: { roles: ['Admin'] },
    canActivate: [roleGuard],
    component: StudentFaceIdComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/',
  },
];
