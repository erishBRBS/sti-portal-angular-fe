import { Routes } from '@angular/router';

import { AnnouncementComponent } from './announcement/announcement.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationComponent } from './notification/notification.component';

export const GENERAL_ROUTES: Routes = [
  {
    path: 'announcements',
    component: AnnouncementComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'notifications',
    component: NotificationComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '',
  },
];
