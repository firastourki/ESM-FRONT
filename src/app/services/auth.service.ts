import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  className?: string;
  classId?: number;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly storageKey = 'esm_token';
  private readonly userKey = 'esm_user';
  private readonly apiUrl = 'http://localhost:8080/api';

  private currentUser = signal<User | null>(this.loadUser());
  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(email: string, password: string): Observable<AuthResponse> {
    const isAdmin = email.toLowerCase() === 'admin@test.com' || email.toLowerCase() === 'admin@lms.com';
    const name = email.includes('@') ? email.split('@')[0] : email;
    const mock: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: { id: '1', email: email.includes('@') ? email : email + '@local', name, role: isAdmin ? 'ADMIN' : 'STUDENT' }
    };
    return new Observable(observer => {
      setTimeout(() => {
        this.setSession(mock);
        observer.next(mock);
        observer.complete();
      }, 300);
    });
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    const mock: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: { id: '1', email, name, role: 'STUDENT' }
    };
    return new Observable(observer => {
      setTimeout(() => {
        this.setSession(mock);
        observer.next(mock);
        observer.complete();
      }, 300);
    });
  }

  // 🆕 Get current user profile from backend
  getMyProfile(): Observable<UserProfile> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<UserProfile>(`${this.apiUrl}/users/me`, { headers }).pipe(
      catchError(() => {
        // Fallback — return stored user info
        const stored = this.currentUser();
        if (stored) {
          return of({
            id: stored.id,
            email: stored.email,
            firstName: stored.name,
            lastName: '',
            className: '',
            role: stored.role
          } as UserProfile);
        }
        return of({} as UserProfile);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.router.navigate(['/signin']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem(this.storageKey, auth.token);
    localStorage.setItem(this.userKey, JSON.stringify(auth.user));
    this.currentUser.set(auth.user);
  }

  private loadUser(): User | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
