import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  bootstrapSpeedometer2,
  bootstrapClipboard2Check,
  bootstrapTrophy,
  bootstrapBarChartLine,
  bootstrapFolder2Open,
  bootstrapCalendarEvent,
  bootstrapJournalBookmark,
  bootstrapPersonPlus,
  bootstrapPersonCheck,
  bootstrapCalendar3,
  bootstrapCreditCard,
  bootstrapFileEarmarkBarGraph,
  bootstrapPeople,
  bootstrapPersonCircle,
  bootstrapBoxArrowRight,
  bootstrapMortarboard,
} from '@ng-icons/bootstrap-icons';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  providers: [provideIcons({
    bootstrapSpeedometer2,
    bootstrapClipboard2Check,
    bootstrapTrophy,
    bootstrapBarChartLine,
    bootstrapFolder2Open,
    bootstrapCalendarEvent,
    bootstrapJournalBookmark,
    bootstrapPersonPlus,
    bootstrapPersonCheck,
    bootstrapCalendar3,
    bootstrapCreditCard,
    bootstrapFileEarmarkBarGraph,
    bootstrapPeople,
    bootstrapPersonCircle,
    bootstrapBoxArrowRight,
    bootstrapMortarboard,
  })],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  userName = 'Admin';
  userEmail = '';

  ngOnInit(): void {
    this.userService.getCurrentUser().pipe(catchError(() => of(null))).subscribe(u => {
      if (u) {
        this.userName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
        this.userEmail = u.email;
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/signin']);
  }
}
