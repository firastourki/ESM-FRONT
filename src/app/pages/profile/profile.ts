import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserResponseDto } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  user: UserResponseDto | null = null;
  isLoading = true;
  isSaving = false;
  isUploadingAvatar = false;
  successMessage = '';
  errorMessage = '';

  // editable fields
  firstName = '';
  lastName = '';
  email = '';
  cin = '';
  phoneNumber = '';
  address = '';

  // student-specific
  parentEmailInput = '';
  savingParentEmail = false;

  private userService = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.firstName = user.firstName ?? '';
        this.lastName = user.lastName ?? '';
        this.email = user.email ?? '';
        this.cin = user.cin ?? '';
        this.phoneNumber = user.phoneNumber ?? '';
        this.address = user.address ?? '';
        this.parentEmailInput = user.parentEmail ?? '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile.';
        this.cdr.detectChanges();
      }
    });
  }

  saveProfile(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSaving = true;
    this.cdr.detectChanges();

    this.userService.updateCurrentUser({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      cin: this.cin,
      phoneNumber: this.phoneNumber,
      address: this.address
    }).subscribe({
      next: (updated) => {
        this.user = updated;
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile.';
        this.cdr.detectChanges();
      }
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingAvatar = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.userService.uploadAvatar(file).subscribe({
      next: (updated) => {
        this.user = updated;
        this.isUploadingAvatar = false;
        this.successMessage = 'Avatar updated.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUploadingAvatar = false;
        this.errorMessage = 'Failed to upload avatar.';
        this.cdr.detectChanges();
      }
    });
  }

  get displayName(): string {
    if (this.firstName || this.lastName) return `${this.firstName} ${this.lastName}`.trim();
    return this.user?.email ?? 'User';
  }

  get roleLabel(): string {
    const r = this.user?.role ?? '';
    return r.charAt(0) + r.slice(1).toLowerCase();
  }

  get roleColor(): string {
    switch (this.user?.role) {
      case 'ADMIN':   return '#ede9fe;color:#6366f1';
      case 'STUDENT': return '#dcfce7;color:#15803d';
      case 'PARENT':  return '#fef3c7;color:#b45309';
      default:        return '#f1f5f9;color:#374151';
    }
  }

  setParentEmail(): void {
    if (!this.parentEmailInput.trim() || !this.user?.id) return;
    this.savingParentEmail = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.userService.setParentEmail(this.user.id, this.parentEmailInput.trim()).subscribe({
      next: (updated) => {
        this.user = updated;
        this.savingParentEmail = false;
        this.successMessage = 'Parent email saved. An invitation has been sent!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingParentEmail = false;
        this.errorMessage = err?.error?.message || 'Failed to set parent email.';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
