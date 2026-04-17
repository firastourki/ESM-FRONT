// src/app/core/services/auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

export interface AuthFlowResponse {
  accessToken: string | null;
  emailVerified: boolean;
  accountStatus: string | null;
  twoFactorRequired: boolean;
  maskedEmail: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'access_token';

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<AuthFlowResponse> {
    return this.http
      .post<AuthFlowResponse>(`${this.API}/login`, { email, password })
      .pipe(
        tap((response) => {
          if (this.isBrowser() && response?.accessToken) {
            localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          }
        })
      );
  }

  verifyTwoFactor(email: string, code: string): Observable<AuthFlowResponse> {
    return this.http
      .post<AuthFlowResponse>(`${this.API}/2fa/verify`, { email, code })
      .pipe(
        tap((response) => {
          if (this.isBrowser() && response?.accessToken) {
            localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          }
        })
      );
  }

  sendEmailVerification(email: string): Observable<void> {
    return this.http.post<void>(`${this.API}/email/send-verification`, { email });
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.API}/password/reset-request`, { email });
  }

  confirmPasswordReset(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API}/password/reset-confirm`, {
      token,
      newPassword
    });
  }

  register(fullName: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, { fullName, email, password });
  }

  // NEW: enable 2FA for current user
  enableTwoFactor(): Observable<void> {
    return this.http.post<void>(`${this.API}/2fa/enable`, {});
  }

  // NEW: disable 2FA for current user
  disableTwoFactor(): Observable<void> {
    return this.http.post<void>(`${this.API}/2fa/disable`, {});
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      this.logout();
      return false;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role ?? null;
    } catch {
      return null;
    }
  }

  getStatus(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.status ?? null;
    } catch {
      return null;
    }
  }

  isEmailVerified(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return !!decoded.emailVerified;
    } catch {
      return false;
    }
  }

  hasRole(...roles: string[]): boolean {
    const userRole = this.getRole();
    return userRole !== null && roles.includes(userRole);
  }
}
