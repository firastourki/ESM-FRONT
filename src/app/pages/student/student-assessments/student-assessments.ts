import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-assessments.html'
})
export class StudentAssessmentsPage implements OnInit {
  assessments: any[] = [];
  loading = true;
  className = '';
  filterStatus = 'ALL';

  private api = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Get student's class from profile, then load class-specific assessments
    this.http.get<any>(`${this.api}/api/users/me`).pipe(
      catchError(() => of(null)),
      switchMap(profile => {
        if (profile?.className) {
          this.className = profile.className;
          return this.http.get<any[]>(`${this.api}/api/assessments/class/${encodeURIComponent(profile.className)}`).pipe(
            catchError(() => of([]))
          );
        }
        // No class assigned — show all published assessments
        return this.http.get<any[]>(`${this.api}/api/assessments`).pipe(catchError(() => of([])));
      })
    ).subscribe(data => {
      this.assessments = data || [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  get filtered(): any[] {
    if (this.filterStatus === 'ALL') return this.assessments;
    return this.assessments.filter(a => a.status === this.filterStatus);
  }

  statusBg(status: string): string {
    switch (status) {
      case 'PUBLISHED': return '#dcfce7';
      case 'DRAFT':     return '#fef3c7';
      case 'CLOSED':    return '#fee2e2';
      default:          return '#f1f5f9';
    }
  }

  statusColor(status: string): string {
    switch (status) {
      case 'PUBLISHED': return '#15803d';
      case 'DRAFT':     return '#b45309';
      case 'CLOSED':    return '#dc2626';
      default:          return '#374151';
    }
  }

  typeBg(type: string): string {
    switch (type) {
      case 'EXAM':    return '#ede9fe';
      case 'QUIZ':    return '#dbeafe';
      case 'PROJECT': return '#fef3c7';
      default:        return '#f1f5f9';
    }
  }

  typeColor(type: string): string {
    switch (type) {
      case 'EXAM':    return '#6d28d9';
      case 'QUIZ':    return '#1d4ed8';
      case 'PROJECT': return '#b45309';
      default:        return '#374151';
    }
  }
}
