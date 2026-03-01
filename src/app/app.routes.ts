import { Routes } from '@angular/router';
// import { authGuard } from './core/guard/auth.guard';

import { LandingPage } from './features/landing/pages/landing.page';

export const routes: Routes = [
  //LANDING PAGE
  { path: '', component: LandingPage },

  // PROTECTED ROUTES
  {
    path: '',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'ats',
        // canActivate: [authGuard],
        loadChildren: () => import('./features/ats/ats.routes').then((m) => m.ATS_ROUTES),
      },
      {
        path: 'gps',
        // canActivate: [authGuard],
        loadChildren: () => import('./features/gps/gps.routes').then((m) => m.GPS_ROUTES),
      },
      {
        path: 'panel',
        // canActivate: [authGuard],
        loadChildren: () => import('./features/admin-panel/admin.routes').then((m) => m.AP_ROUTES),
      },
      //PUBLIC PAGE
      {
        path: 'general',
        loadChildren: () =>
          import('./features/general/general.routes').then((m) => m.GENERAL_ROUTES),
      },
      {
        path: 'others',
        loadChildren: () => import('./features/others/others.routes').then((m) => m.OTHERS_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
