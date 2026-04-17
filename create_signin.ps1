$dest = "C:\Users\Firas\Pidev\esm-front\src\app\pages\signin"

# ── signin.ts ──────────────────────────────────────────────────────────────────
$signinTs = @'
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

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.http.post<any>('http://localhost:8080/api/auth/login', {
      email: this.email,
      password: this.password
    }).pipe(catchError(err => {
      this.error = err?.error?.message || 'Invalid credentials. Please try again.';
      this.loading = false;
      return of(null);
    })).subscribe((res: any) => {
      if (!res) return;
      this.loading = false;

      const token = res.token || res.accessToken || res.access_token || '';
      const user = res.user || res;
      localStorage.setItem('esm_token', token);
      localStorage.setItem('esm_user', JSON.stringify(user));

      const role = (user?.role || '').toUpperCase();

      if (role === 'ADMIN' || role === 'TUTOR') {
        this.router.navigate(['/backoffice/dashboard']);
      } else if (role === 'STUDENT') {
        this.router.navigate(['/student/home']);
      } else if (role === 'PARENT') {
        this.router.navigate(['/parent/dashboard']);
      } else {
        this.router.navigate(['/backoffice/dashboard']);
      }
    });
  }

  quickLogin(role: string) {
    const creds: any = {
      ADMIN: { email: 'admin@test.com', password: 'admin123' },
      STUDENT: { email: 'student@test.com', password: 'student123' },
      PARENT: { email: 'parent@test.com', password: 'parent123' }
    };
    this.email = creds[role].email;
    this.password = creds[role].password;
    this.login();
  }
}
'@
[System.IO.File]::WriteAllText("$dest\signin.ts", $signinTs, [System.Text.Encoding]::UTF8)
Write-Host "signin.ts cree" -ForegroundColor Green

# ── signin.html ────────────────────────────────────────────────────────────────
$signinHtml = @'
<div style="min-height:100vh;background:#f8fafc;display:flex;flex-direction:column;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:3rem 2rem;text-align:center;color:white;">
    <div style="font-size:2rem;font-weight:800;margin-bottom:0.5rem;">&#127891; Fluencity</div>
    <div style="font-size:1rem;opacity:0.9;">English School Management</div>
  </div>

  <!-- Form -->
  <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2rem;">
    <div style="background:white;border-radius:16px;padding:2.5rem;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <h2 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;text-align:center;">Welcome back</h2>
      <p style="font-size:0.875rem;color:#64748b;text-align:center;margin-bottom:2rem;">Sign in to your account</p>

      <!-- Error -->
      <div *ngIf="error" style="background:#fee2e2;color:#dc2626;padding:0.75rem 1rem;border-radius:8px;margin-bottom:1.5rem;font-size:0.875rem;display:flex;align-items:center;gap:0.5rem;">
        &#9888; {{ error }}
      </div>

      <form (ngSubmit)="login()">

        <!-- Email -->
        <div style="margin-bottom:1.25rem;">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.5rem;">Email Address</label>
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            placeholder="your@email.com"
            style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:0.875rem 1rem;font-size:0.875rem;outline:none;box-sizing:border-box;transition:border-color 0.2s;"
            (focus)="$event.target.style.borderColor='#6366f1'"
            (blur)="$event.target.style.borderColor='#e2e8f0'"
          />
        </div>

        <!-- Password -->
        <div style="margin-bottom:1.5rem;">
          <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.5rem;">Password</label>
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            placeholder="Enter your password"
            style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:0.875rem 1rem;font-size:0.875rem;outline:none;box-sizing:border-box;transition:border-color 0.2s;"
            (focus)="$event.target.style.borderColor='#6366f1'"
            (blur)="$event.target.style.borderColor='#e2e8f0'"
          />
        </div>

        <!-- Sign In Button -->
        <button
          type="submit"
          [disabled]="loading"
          style="width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:0.875rem;border-radius:10px;font-size:1rem;font-weight:600;border:none;cursor:pointer;transition:opacity 0.2s;"
          [style.opacity]="loading ? '0.7' : '1'"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

      </form>

      <!-- Divider -->
      <div style="display:flex;align-items:center;gap:1rem;margin:1.5rem 0;">
        <div style="flex:1;height:1px;background:#e2e8f0;"></div>
        <span style="font-size:0.75rem;color:#94a3b8;">Quick Demo Access</span>
        <div style="flex:1;height:1px;background:#e2e8f0;"></div>
      </div>

      <!-- Demo Buttons -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;">
        <button type="button" (click)="quickLogin('ADMIN')"
          style="padding:0.75rem;background:#ede9fe;color:#6366f1;border-radius:10px;font-size:0.8rem;font-weight:700;border:none;cursor:pointer;">
          &#128100; Admin
        </button>
        <button type="button" (click)="quickLogin('STUDENT')"
          style="padding:0.75rem;background:#dcfce7;color:#15803d;border-radius:10px;font-size:0.8rem;font-weight:700;border:none;cursor:pointer;">
          &#127891; Student
        </button>
        <button type="button" (click)="quickLogin('PARENT')"
          style="padding:0.75rem;background:#fef3c7;color:#b45309;border-radius:10px;font-size:0.8rem;font-weight:700;border:none;cursor:pointer;">
          &#128106; Parent
        </button>
      </div>

      <!-- Footer Links -->
      <div style="text-align:center;margin-top:1.5rem;font-size:0.875rem;color:#64748b;">
        Don't have an account?
        <a routerLink="/signup" style="color:#6366f1;font-weight:600;text-decoration:none;">Sign up</a>
      </div>

    </div>
  </div>
</div>
'@
[System.IO.File]::WriteAllText("$dest\signin.html", $signinHtml, [System.Text.Encoding]::UTF8)
Write-Host "signin.html cree" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  SIGNIN COMPLET ! Lance: ng serve" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
