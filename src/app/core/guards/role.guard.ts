import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const allowed = (route.data['roles'] as string[] | undefined) ?? [];
  const user = auth.currentUser;

  // not logged in
  if (!auth.isLoggedIn || !user) {
    return router.parseUrl('/');
  }

  // if no roles specified, allow
  if (allowed.length === 0) return true;

  // compare role_name (e.g. "Admin")
  const userRole = (user.role_name || '').toLowerCase();
  const ok = allowed.map(r => r.toLowerCase()).includes(userRole);

  if (ok) return true;

  // optional: redirect to default inside page based on role
  // if (userRole === 'admin') return router.parseUrl('/attendance/admin-dashboard');
  // if (userRole === 'professor') return router.parseUrl('/attendance/teacher-dashboard');
  // if (userRole === 'student') return router.parseUrl('/attendance/student-dashboard');
  // if (userRole === 'parent') return router.parseUrl('/grades/parent-dashboard'); // adjust
  return router.parseUrl('/');
};