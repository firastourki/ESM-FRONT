import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, forkJoin, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-courses.html'
})
export class StudentCoursesPage implements OnInit {
  enrolledCourses: any[] = [];
  availableCourses: any[] = [];
  loading = true;
  filterLevel = 'ALL';
  levels = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  activeTab: 'enrolled' | 'browse' = 'enrolled';

  userUuid = '';
  studentName = '';
  walletBalance = 0;

  enrollingCourseId: number | null = null;
  enrollSuccess = '';
  enrollError = '';

  private api = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userUuid = this.auth.getUserId() || '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<any>(`${this.api}/api/users/me`).pipe(
      catchError(() => of(null))
    ).subscribe(profile => {
      if (profile) {
        this.studentName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email;
        this.walletBalance = profile.walletBalance ?? 0;
      }
      this.loadData();
    });
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      enrolled: this.userUuid
        ? this.http.get<any[]>(`${this.api}/api/v1/enrollments/user/${this.userUuid}/my-courses`).pipe(catchError(() => of([])))
        : of([]),
      courses: this.http.get<any>(`${this.api}/api/v1/courses?isPublished=true&size=100`).pipe(catchError(() => of({ content: [] })))
    }).subscribe(({ enrolled, courses }) => {
      this.enrolledCourses = enrolled || [];
      const allCourses: any[] = (courses as any)?.content || (Array.isArray(courses) ? courses : []);
      const enrolledIds = new Set((enrolled || []).map((e: any) => e.courseId));
      this.availableCourses = allCourses.filter(c => !enrolledIds.has(c.courseId));
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  enroll(course: any): void {
    if (!this.userUuid) {
      this.enrollError = 'Not logged in.';
      return;
    }
    this.enrollingCourseId = course.courseId;
    this.enrollError = '';
    this.enrollSuccess = '';
    this.cdr.detectChanges();

    const idempotencyKey = `enroll-${this.userUuid}-${course.courseId}-${Date.now()}`;
    const body = {
      userUuid: this.userUuid,
      studentName: this.studentName,
      courseId: course.courseId,
      status: 'active'
    };

    this.http.post<any>(`${this.api}/api/v1/enrollments`, body, {
      headers: new HttpHeaders({ 'X-Idempotency-Key': idempotencyKey })
    }).pipe(
      catchError(err => {
        const msg = err?.error?.message || err?.message || '';
        this.enrollError = msg.toLowerCase().includes('wallet') || msg.toLowerCase().includes('balance')
          ? 'Insufficient wallet balance. Please ask your parent to top up your wallet.'
          : (msg || 'Enrollment failed. Please try again.');
        this.enrollingCourseId = null;
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.enrollSuccess = `Successfully enrolled in "${course.title || course.name}"!`;
        this.enrollingCourseId = null;
        this.loadData();
        setTimeout(() => { this.enrollSuccess = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }

  get filteredAvailable(): any[] {
    const list = this.filterLevel === 'ALL' ? this.availableCourses : this.availableCourses.filter(c => c.level === this.filterLevel);
    return list;
  }

  levelBg(level: string): string {
    const map: Record<string, string> = { A1: '#dcfce7', A2: '#bbf7d0', B1: '#dbeafe', B2: '#bfdbfe', C1: '#ede9fe', C2: '#ddd6fe' };
    return map[level] ?? '#f1f5f9';
  }

  levelColor(level: string): string {
    const map: Record<string, string> = { A1: '#15803d', A2: '#166534', B1: '#1d4ed8', B2: '#1e40af', C1: '#6d28d9', C2: '#5b21b6' };
    return map[level] ?? '#374151';
  }

  progressColor(pct: number): string {
    if (pct >= 100) return '#22c55e';
    if (pct >= 50) return '#6366f1';
    return '#f59e0b';
  }
}
