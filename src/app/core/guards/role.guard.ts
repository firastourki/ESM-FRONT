// src/app/core/guards/role.guard.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  role: string;
  status?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  iat: number;
  exp: number;
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // allow SSR
  }

  const token = localStorage.getItem('access_token');
  if (!token) {
    return router.createUrlTree(['/signin']);
  }

  try {
    const decoded: JwtPayload = jwtDecode(token);
    const allowedRoles = route.data['allowedRoles'] as string[];

    if (!allowedRoles.includes(decoded.role)) {
      const roleRoutes: Record<string, string> = {
        ADMIN: '/admin',
        TUTOR: '/backoffice',
        STUDENT: '/student',
        PARENT: '/parent'
      };
      const userDashboard = roleRoutes[decoded.role] || '/';
      return router.createUrlTree([userDashboard]);
    }

    return true;
  } catch {
    localStorage.removeItem('access_token');
    return router.createUrlTree(['/signin']);
  }
};
