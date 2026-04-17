// src/app/pages/reset-password/reset-password.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [RouterModule, FormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {
  token = '';
  newPassword = '';
  repeatPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const fromUrl = this.route.snapshot.queryParamMap.get('token');
    if (fromUrl) {
      this.token = fromUrl;
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    if (!this.token) {
      this.errorMessage = 'Missing reset token in URL. Please use the link from your email.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.newPassword || !this.repeatPassword) {
      this.errorMessage = 'Please fill in both password fields.';
      this.cdr.markForCheck();
      return;
    }

    if (this.newPassword !== this.repeatPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.cdr.markForCheck();
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.auth.confirmPasswordReset(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password has been reset. You can now sign in.';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          'Failed to reset password. Token may be invalid or expired.';
        this.cdr.markForCheck();
      }
    });
  }
}
