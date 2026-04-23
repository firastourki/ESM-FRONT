import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-schedule.html'
})
export class StudentSchedulePage implements OnInit {
  schedules: any[] = [];
  courseMap: Record<number, string> = {};
  className = '';
  loading = true;

  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  readonly dayColors: Record<string, string> = {
    Monday: '#6366f1', Tuesday: '#0ea5e9', Wednesday: '#10b981',
    Thursday: '#f59e0b', Friday: '#ef4444', Saturday: '#ec4899', Sunday: '#8b5cf6'
  };

  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${this.api}/api/users/me`).pipe(
      catchError(() => of(null)),
      switchMap(profile => {
        this.className = profile?.className || '';
        const schedules$ = this.className
          ? this.http.get<any[]>(`${this.api}/api/schedules/class?name=${encodeURIComponent(this.className)}`).pipe(
              catchError(() => this.http.get<any[]>(`${this.api}/api/schedules`).pipe(catchError(() => of([])))))
          : this.http.get<any[]>(`${this.api}/api/schedules`).pipe(catchError(() => of([])));

        const courses$ = this.http.get<any>(`${this.api}/api/v1/courses?size=200`).pipe(catchError(() => of([])));

        return forkJoin({ schedules: schedules$, courses: courses$ });
      })
    ).subscribe(({ schedules, courses }: any) => {
      const list: any[] = Array.isArray(courses) ? courses : (courses?.content ?? []);
      list.forEach((c: any) => { if (c.courseId) this.courseMap[c.courseId] = c.name; });
      this.schedules = schedules || [];
      this.loading = false;
    });
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
