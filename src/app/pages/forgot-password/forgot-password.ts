// src/app/pages/forgot-password/forgot-password.ts
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [RouterModule, FormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.auth.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'If this email exists, a reset link/token has been sent.';
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to request password reset.';
        this.cdr.markForCheck();
      }
    });
  }
}
