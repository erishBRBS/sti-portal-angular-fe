import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  // SSR pass: huwag mag-check ng localStorage/user state sa server
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const allowed = (route.data['roles'] as string[] | undefined) ?? [];
  const user = auth.currentUser;

  // not logged in
  if (!auth.isLoggedIn || !user) {
    return router.parseUrl('/');
  }

  // if no roles specified, allow
  if (allowed.length === 0) {
    return true;
  }

  // compare role_name (e.g. "Admin")
  const userRole = (user.role_name || '').toLowerCase();
  const ok = allowed.map((r) => r.toLowerCase()).includes(userRole);

  if (ok) {
    return true;
  }

  return router.parseUrl('/');
};