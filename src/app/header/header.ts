import { Component, OnInit, PLATFORM_ID, inject, ElementRef, HostListener } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private router = inject(Router);
  private el = inject(ElementRef);

  dropdownOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get userRole(): string {
    return this.auth.getRole() ?? '';
  }

  get userEmail(): string {
    return this.auth.getEmail() ?? '';
  }

  get userInitial(): string {
    const email = this.userEmail;
    return email ? email.charAt(0).toUpperCase() : (this.userRole.charAt(0) || '?');
  }

  get roleLabel(): string {
    switch (this.userRole) {
      case 'ADMIN':   return 'Administrator';
      case 'TUTOR':   return 'Tutor';
      case 'STUDENT': return 'Student';
      case 'PARENT':  return 'Parent';
      default:        return this.userRole;
    }
  }

  get avatarColor(): string {
    switch (this.userRole) {
      case 'ADMIN':   return '#6366f1';
      case 'TUTOR':   return '#3b82f6';
      case 'STUDENT': return '#10b981';
      case 'PARENT':  return '#f59e0b';
      default:        return '#6366f1';
    }
  }

  get dashboardLink(): string {
    switch (this.userRole) {
      case 'ADMIN':   return '/backoffice/dashboard';
      case 'TUTOR':   return '/tutor/dashboard';
      case 'STUDENT': return '/student/home';
      case 'PARENT':  return '/parent/dashboard';
      default:        return '/';
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.auth.logout();
    this.dropdownOpen = false;
    this.router.navigate(['/']);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupMobileMenu();
    }
  }

  private setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton?.addEventListener('click', () => {
      const isHidden = mobileMenu?.classList.contains('hidden');
      if (isHidden) {
        mobileMenu?.classList.remove('hidden');
        mobileMenuButton?.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu?.classList.add('hidden');
        mobileMenuButton?.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
