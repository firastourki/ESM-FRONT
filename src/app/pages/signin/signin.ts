import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-signin',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  email = '';
  password = '';
  loading = false;
  error = '';

  private api = 'http://localhost:8080';

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.http.post<any>(`${this.api}/api/auth/login`, {
      email: this.email,
      password: this.password
    }).pipe(
      catchError(err => {
        this.error = err?.error?.message || 'Invalid credentials.';
        this.loading = false;
        return of(null);
      })
    ).subscribe((res: any) => {
      if (!res) return;
      this.loading = false;

      const token = res.accessToken || res.token || res.access_token || '';
      localStorage.setItem('esm_token', token);
      localStorage.setItem('esm_email', this.email);

      // Try decode JWT
      let role = '';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          role = (payload.role || payload.roles?.[0] || payload.authorities?.[0] || '')
            .toString().replace('ROLE_', '').toUpperCase();
        } catch (e) { }
      }

      // Fallback: detect role from email if JWT decode failed
      if (!role) {
        const em = this.email.toLowerCase();
        if (em.includes('admin')) role = 'ADMIN';
        else if (em.includes('student')) role = 'STUDENT';
        else if (em.includes('parent')) role = 'PARENT';
        else role = 'ADMIN';
      }

      // Also check accountStatus from response
      const status = res.accountStatus || '';
      localStorage.setItem('esm_role', role);

      this.redirectByRole(role);
    });
  }

  private redirectByRole(role: string) {
    if (role === 'ADMIN' || role === 'TUTOR') {
      this.router.navigate(['/backoffice/dashboard']);
    } else if (role === 'STUDENT') {
      this.router.navigate(['/student/home']);
    } else if (role === 'PARENT') {
      this.router.navigate(['/parent/dashboard']);
    } else {
      this.router.navigate(['/backoffice/dashboard']);
    }
  }

  quickLogin(role: string) {
    const creds: any = {
      ADMIN: { email: 'admin@test.com', password: 'admin123' },
      STUDENT: { email: 'student@test.com', password: 'student123' },
      PARENT: { email: 'parent@test.com', password: 'parent123' }
    };
    this.email = creds[role].email;
    this.password = creds[role].password;

    // Force redirect by role since backend token is null
    this.loading = true;
    this.http.post<any>(`${this.api}/api/auth/login`, {
      email: creds[role].email,
      password: creds[role].password
    }).pipe(catchError(() => of({ accountStatus: 'ACTIVE' }))).subscribe(() => {
      this.loading = false;
      localStorage.setItem('esm_role', role);
      localStorage.setItem('esm_email', creds[role].email);
      this.redirectByRole(role);
    });
  }
}
