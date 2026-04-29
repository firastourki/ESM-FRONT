// src/app/core/services/auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  sub: string;
  userId?: string;
  email?: string;
  role: string;
  status?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  iat: number;
  exp: number;
}

export interface AuthFlowResponse {
  token?: string;
  accessToken?: string | null;
  requiresTwoFactor?: boolean;
  twoFactorRequired?: boolean;
  emailVerified?: boolean;
  accountStatus?: string | null;
  userId?: string;
  role?: string;
  maskedEmail?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/api/auth`;
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
        tap((response: any) => {
          const jwt = response?.token || response?.accessToken;
          if (this.isBrowser() && jwt) {
            localStorage.setItem(this.TOKEN_KEY, jwt);
          }
          // Normalize 2FA field name
          if (response?.requiresTwoFactor !== undefined && response?.twoFactorRequired === undefined) {
            response.twoFactorRequired = response.requiresTwoFactor;
          }
        })
      );
  }

  verifyTwoFactor(email: string, code: string): Observable<AuthFlowResponse> {
    return this.http
      .post<AuthFlowResponse>(`${this.API}/2fa/verify`, { email, code })
      .pipe(
        tap((response: any) => {
          const jwt = response?.token || response?.accessToken;
          if (this.isBrowser() && jwt) {
            localStorage.setItem(this.TOKEN_KEY, jwt);
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

  register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    cin?: string;
    phoneNumber?: string;
    address?: string;
    role?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, data);
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

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.userId || decoded.sub || null;
    } catch {
      return null;
    }
  }

  getEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.email ?? decoded.sub ?? null;
    } catch {
      return null;
    }
  }
}
