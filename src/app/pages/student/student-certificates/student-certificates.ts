import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-certificates.html'
})
export class StudentCertificatesPage implements OnInit {
  certificates: any[] = [];
  loading = true;
  studentId: number | null = null;
  studentName = '';

  private api = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<any>(`${this.api}/api/users/me`).pipe(
      catchError(() => of(null)),
      switchMap(profile => {
        if (profile?.id) {
          this.studentId = profile.id;
          this.studentName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
          // Get completed enrollments, then list them as downloadable certificates
          return this.http.get<any[]>(`${this.api}/api/v1/enrollments/user/${profile.id}/my-courses`).pipe(
            catchError(() => of([]))
          );
        }
        return of([]);
      })
    ).subscribe((data: any[]) => {
      // Show enrollments that are 100% complete or have completedAt set
      this.certificates = (data || []).filter((e: any) => e.progressPercent >= 100 || e.completedAt);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  download(cert: any): void {
    const url = `${this.api}/api/v1/certificates/enrollment/${cert.enrollmentId}/download`;
    window.open(url, '_blank');
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  scoreColor(score: number): string {
    if (score >= 80) return '#15803d';
    if (score >= 60) return '#b45309';
    return '#dc2626';
  }

  scoreBg(score: number): string {
    if (score >= 80) return '#dcfce7';
    if (score >= 60) return '#fef3c7';
    return '#fee2e2';
  }
}
