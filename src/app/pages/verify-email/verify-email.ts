import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-verify-email',
  imports: [RouterModule],
  templateUrl: './verify-email.html'
})
export class VerifyEmail implements OnInit {
  message = 'Verifying your email, please wait…';
  isError = false;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.isError = true;
      this.message = 'Missing verification token. Please use the link from your email.';
      this.cdr.detectChanges();
      return;
    }

    this.http.post<void>(`${environment.apiUrl}/api/auth/email/verify`, { token }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isError = false;
        this.message = 'Your email has been verified! Redirecting to sign in…';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/signin']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.isError = true;
        this.message = err?.error?.message || 'Verification failed. The link may be invalid or expired.';
        this.cdr.detectChanges();
      }
    });
  }
}
