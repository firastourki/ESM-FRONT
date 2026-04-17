import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">My Courses</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
      <div *ngIf="!loading && courses.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No courses enrolled yet.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
        <div *ngFor="let c of courses" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;">
          <div style="font-size:1rem;font-weight:700;color:#1e293b;">{{ c.title }}</div>
          <div style="font-size:0.8rem;color:#64748b;margin-top:4px;">{{ c.description }}</div>
        </div>
      </div>
    </div>
  `
})
export class StudentCoursesPage implements OnInit {
  courses: any[] = [];
  loading = true;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(this.api + '/api/v1/courses').pipe(catchError(() => of({ content: [] }))).subscribe((d: any) => {
      this.courses = d?.content || d || [];
      this.loading = false;
    });
  }
}
