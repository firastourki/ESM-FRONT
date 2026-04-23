import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
  twoFactorCode = '';

  loading = false;
  error = '';
  infoMessage = '';

  // 'login' → normal form | '2fa' → code input | 'unverified' → resend prompt
  step: 'login' | '2fa' | 'unverified' = 'login';
  maskedEmail = '';

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.twoFactorRequired) {
          this.step = '2fa';
          this.maskedEmail = res.maskedEmail || this.email;
          this.cdr.markForCheck();
          return;
        }

        if (!res.emailVerified) {
          this.step = 'unverified';
          this.cdr.markForCheck();
          return;
        }

        this.cdr.markForCheck();
        this.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid credentials.';
        this.cdr.markForCheck();
      }
    });
  }

  verify2FA(): void {
    if (!this.twoFactorCode.trim()) {
      this.error = 'Please enter the 6-digit code.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.auth.verifyTwoFactor(this.email, this.twoFactorCode).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid or expired code.';
        this.cdr.markForCheck();
      }
    });
  }

  resendVerification(): void {
    this.infoMessage = '';
    this.error = '';
    this.auth.sendEmailVerification(this.email).subscribe({
      next: () => {
        this.infoMessage = 'Verification email sent. Please check your inbox.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to resend verification email.';
        this.cdr.markForCheck();
      }
    });
  }

  backToLogin(): void {
    this.step = 'login';
    this.error = '';
    this.infoMessage = '';
    this.twoFactorCode = '';
  }

  private redirectByRole(): void {
    const role = this.auth.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/backoffice/dashboard']);
    } else if (role === 'TUTOR') {
      this.router.navigate(['/tutor/dashboard']);
    } else if (role === 'STUDENT') {
      this.router.navigate(['/student/home']);
    } else if (role === 'PARENT') {
      this.router.navigate(['/parent/dashboard']);
    } else {
      this.router.navigate(['/backoffice/dashboard']);
    }
  }

  quickLogin(role: string): void {
    const creds: Record<string, { email: string; password: string }> = {
      ADMIN:   { email: 'admin@test.com',   password: 'admin123'   },
      STUDENT: { email: 'student@test.com', password: 'student123' },
      PARENT:  { email: 'parent@test.com',  password: 'parent123'  }
    };
    this.email = creds[role].email;
    this.password = creds[role].password;
    this.login();
  }
}
