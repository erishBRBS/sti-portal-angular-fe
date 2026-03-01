import { Routes } from '@angular/router';
// import { roleGuard } from '../core/guard/role.guard';

import { AnnouncementComponent } from './announcement-management/announcement.component';
import { CourseComponent } from './curriculum-management/course/course.component';
import { RoomComponent } from './curriculum-management/room/room.component';
import { ScheduleComponent } from './curriculum-management/schedule/schedule.component';
import { SectionComponent } from './curriculum-management/section/section.component';
import { SubjectComponent } from './curriculum-management/subject/subject.component';
import { GuardianManagementComponent } from './guardian-management/guardian-management';
import { AdminManagementComponent } from './user-management/admin/admin.component';
import { ParentManagementComponent } from './user-management/parent/parent.component';
import { ProfessorManagementComponent } from './user-management/professor/professor.component';
import { StudentManagementComponent } from './user-management/student/student.component';

export const AP_ROUTES: Routes = [
  //ANNOUNCEMENT MANAGEMENT
  {
    path: 'admin/announcement-management',
    // canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    component: AnnouncementComponent,
  },
  //CURRICULUM MANAGEMENT
    {
    path: 'admin/curriculum-management/course',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: CourseComponent,
  },
  {
    path: 'admin/curriculum-management/room',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: RoomComponent,
  },
  {
    path: 'admin/curriculum-management/schedule',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: ScheduleComponent,
  },
  {
    path: 'admin/curriculum-management/section',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: SectionComponent,
  },
  {
    path: 'admin/curriculum-management/subject',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: SubjectComponent,
  },
  //GUARDIAN MANAGEMENT
  {
    path: 'admin/guardian-management',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: GuardianManagementComponent,
  },
  //USER MANAGEMENT
  {
    path: 'admin/user-management/admin',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: AdminManagementComponent,
  },
  {
    path: 'admin/user-management/parent',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: ParentManagementComponent,
  },
  {
    path: 'admin/user-management/professor',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: ProfessorManagementComponent,
  },
  {
    path: 'admin/user-management/student',
    data: { roles: ['Admin'] },
    // canActivate: [roleGuard],
    component: StudentManagementComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/',
  },
];
