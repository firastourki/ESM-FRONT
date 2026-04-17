// src/app/pages/verify-email/verify-email.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface EmailVerifyRequest {
  token: string;
}

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.html'
})
export class VerifyEmail implements OnInit {
  message = 'Verifying your email...';
  isError = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isError = true;
      this.message = 'Missing verification token.';
      return;
    }

    const body: EmailVerifyRequest = { token };

    this.http.post<void>('http://localhost:8080/api/auth/email/verify', body).subscribe({
      next: () => {
        this.isError = false;
        this.message = 'Your email has been verified. You can now sign in.';
        setTimeout(() => this.router.navigate(['/signin']), 2000);
      },
      error: (err) => {
        this.isError = true;
        this.message =
          err?.error?.message || 'Verification failed. The link may be invalid or expired.';
      }
    });
  }
}
