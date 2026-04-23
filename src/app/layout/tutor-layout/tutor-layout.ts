import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-tutor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './tutor-layout.html',
  styleUrls: ['./tutor-layout.css']
})
export class TutorLayout implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  userName = 'Tutor';

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(catchError(() => of(null))).subscribe(u => {
      if (u) this.userName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
