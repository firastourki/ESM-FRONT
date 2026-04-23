import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [RouterModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  firstName = '';
  lastName = '';
  email = '';
  cin = '';
  phoneNumber = '';
  address = '';
  role = 'STUDENT';
  password = '';
  repeatPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      this.cdr.markForCheck();
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.cdr.markForCheck();
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.auth.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      cin: this.cin,
      phoneNumber: this.phoneNumber,
      address: this.address,
      role: this.role,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created! Redirecting to sign in…';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/signin']), 1800);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        this.cdr.markForCheck();
      },
    });
  }
}
