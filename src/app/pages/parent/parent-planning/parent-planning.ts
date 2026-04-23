import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-planning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">Planning</h1>

      @if (childEmail) {
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:0.75rem 1rem;margin-bottom:1.5rem;font-size:0.8rem;color:#1d4ed8;">
          Showing schedule for: <strong>{{ childEmail }}</strong>
        </div>
      }

      <!-- Upcoming Assessments -->
      <div style="margin-bottom:2rem;">
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Upcoming Assessments</h2>
        @if (assessments.length === 0) {
          <div style="color:#94a3b8;padding:1rem;background:white;border-radius:8px;border:1px solid #e2e8f0;">No upcoming assessments.</div>
        }
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          @for (a of assessments; track a.id) {
            <div style="background:white;border-radius:10px;padding:1rem;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:700;color:#1e293b;">{{ a.title }}</div>
                <div style="font-size:0.8rem;color:#64748b;">{{ a.courseName }} — {{ a.type }}</div>
              </div>
              <div style="font-size:0.8rem;color:#6366f1;font-weight:600;">{{ a.startDate | date:'dd/MM/yyyy' }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Class Schedule -->
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">📆 Class Schedule</h2>
        @if (schedules.length === 0) {
          <div style="color:#94a3b8;padding:1rem;background:white;border-radius:8px;border:1px solid #e2e8f0;">No schedule assigned yet.</div>
        }
        @for (day of days; track day) {
          @if (forDay(day).length > 0) {
            <div style="margin-bottom:1.25rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                <span style="width:10px;height:10px;border-radius:50%;display:inline-block;" [style.background]="color(day)"></span>
                <span style="font-size:0.875rem;font-weight:700;color:#1e293b;">{{ day }}</span>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:0.75rem;padding-left:1.25rem;">
                @for (s of forDay(day); track s.id) {
                  <div style="background:white;border-radius:10px;padding:0.875rem 1rem;border:1px solid #e2e8f0;min-width:200px;flex:1;max-width:280px;position:relative;overflow:hidden;">
                    <div style="position:absolute;left:0;top:0;bottom:0;width:4px;" [style.background]="color(day)"></div>
                    <div style="font-weight:700;color:#1e293b;font-size:0.9rem;margin-bottom:0.35rem;">{{ courseName(s) }}</div>
                    <div style="font-size:0.78rem;color:#64748b;">🕐 {{ s.startTime?.substring(0,5) }} – {{ s.endTime?.substring(0,5) }}</div>
                    <div style="font-size:0.78rem;color:#64748b;">🚪 Room {{ s.room }}</div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Child Attendance -->
      <div style="margin-top:2rem;">
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Attendance</h2>
        @if (attendance.length === 0) {
          <div style="color:#94a3b8;padding:1rem;background:white;border-radius:8px;border:1px solid #e2e8f0;">No attendance records.</div>
        }
        <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          @if (attendance.length > 0) {
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#f8fafc;"><tr>
                <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Date</th>
                <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Status</th>
              </tr></thead>
              <tbody>
                @for (r of attendance.slice(0, 10); track r.id) {
                  <tr style="border-top:1px solid #f1f5f9;">
                    <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ r.date }}</td>
                    <td style="padding:0.75rem 1rem;">
                      <span [style.background]="r.status==='PRESENT'?'#dcfce7':r.status==='ABSENT'?'#fee2e2':'#fef3c7'"
                            [style.color]="r.status==='PRESENT'?'#15803d':r.status==='ABSENT'?'#dc2626':'#b45309'"
                            style="padding:2px 8px;border-radius:99px;font-size:0.75rem;font-weight:600;">
                        {{ r.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `
})
export class ParentPlanningPage implements OnInit {
  assessments: any[] = [];
  schedules: any[] = [];
  attendance: any[] = [];
  courseMap: Record<number, string> = {};
  childEmail = '';
  childClassName = '';

  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  readonly dayColors: Record<string, string> = {
    Monday: '#6366f1', Tuesday: '#0ea5e9', Wednesday: '#10b981',
    Thursday: '#f59e0b', Friday: '#ef4444', Saturday: '#ec4899', Sunday: '#8b5cf6'
  };

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.childEmail = localStorage.getItem('parent_child_email') || '';
    const now = Date.now();

    // Load assessments
    this.http.get<any[]>(`${this.api}/api/assessments`).pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.assessments = (d || []).filter((a: any) => a.status === 'PUBLISHED' && a.startDate && new Date(a.startDate).getTime() > now);
    });

    // Load courses for name resolution
    const courses$ = this.http.get<any>(`${this.api}/api/v1/courses?size=200`).pipe(catchError(() => of([])));

    if (this.childEmail) {
      // Look up child's className, then load their schedule + courses together
      this.http.get<any>(`${this.api}/api/users?email=${encodeURIComponent(this.childEmail)}&size=1`).pipe(
        catchError(() => of(null)),
        switchMap((page: any) => {
          const child = page?.content?.[0] || null;
          this.childClassName = child?.className || '';
          const schedules$ = this.childClassName
            ? this.http.get<any[]>(`${this.api}/api/schedules/class?name=${encodeURIComponent(this.childClassName)}`).pipe(
                catchError(() => this.http.get<any[]>(`${this.api}/api/schedules`).pipe(catchError(() => of([])))))
            : this.http.get<any[]>(`${this.api}/api/schedules`).pipe(catchError(() => of([])));
          return forkJoin({ schedules: schedules$, courses: courses$ });
        })
      ).subscribe(({ schedules, courses }: any) => {
        const list: any[] = Array.isArray(courses) ? courses : (courses?.content ?? []);
        list.forEach((c: any) => { if (c.courseId) this.courseMap[c.courseId] = c.name; });
        this.schedules = schedules || [];
      });

      // Attendance
      this.http.get<any[]>(`${this.api}/api/attendances/student/${encodeURIComponent(this.childEmail)}`).pipe(
        catchError(() => this.http.get<any[]>(`${this.api}/api/attendances`).pipe(catchError(() => of([]))))
      ).subscribe((d: any) => { this.attendance = d || []; });

    } else {
      forkJoin({
        schedules: this.http.get<any[]>(`${this.api}/api/schedules`).pipe(catchError(() => of([]))),
        courses: courses$
      }).subscribe(({ schedules, courses }: any) => {
        const list: any[] = Array.isArray(courses) ? courses : (courses?.content ?? []);
        list.forEach((c: any) => { if (c.courseId) this.courseMap[c.courseId] = c.name; });
        this.schedules = schedules || [];
      });
    }
  }

  forDay(day: string): any[] {
    return this.schedules.filter(s => s.dayOfWeek === day);
  }

  courseName(s: any): string {
    if (s.courseId && this.courseMap[s.courseId]) return this.courseMap[s.courseId];
    return s.courseName || s.subject || 'Course';
  }

  color(day: string): string {
    return this.dayColors[day] ?? '#6366f1';
  }
}
