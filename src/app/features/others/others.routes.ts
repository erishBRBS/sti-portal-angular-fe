import { Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { MvhComponent } from './mvh/mvh.component';
import { FaqsComponent } from './faqs/faqs.component';


export const OTHERS_ROUTES: Routes = [
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'faqs',
    component: FaqsComponent,
  },
  {
    path: 'mvh',
    component: MvhComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '',
  },
];
