// src/app/core/guards/auth.guard.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
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

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // SSR: let Angular render the shell; client-side hydration will enforce auth
  if (!isPlatformBrowser(platformId)) return true;

  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/signin']);
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('access_token');
      router.navigate(['/signin']);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('access_token');
    router.navigate(['/signin']);
    return false;
  }
};
