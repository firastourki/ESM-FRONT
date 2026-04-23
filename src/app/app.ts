import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public router: Router) { }

  get hideShell(): boolean {
    const url = this.router.url.split('?')[0];
    const authRoutes = ['backoffice', 'tutor', 'student', 'parent', 'signin', 'signup',
      'verify-email', 'forgot-password', 'reset-password'];
    return authRoutes.some(r => url.includes(r));
  }
}
