import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-layout.html',
  styleUrls: ['./student-layout.css']
})
export class StudentLayout implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  userName = 'Student';

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(catchError(() => of(null))).subscribe(u => {
      if (u) {
        this.userName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
