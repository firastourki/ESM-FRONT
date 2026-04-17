import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-parent-planning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">Planning</h1>
      <div style="margin-bottom:2rem;">
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Upcoming Assessments</h2>
        <div *ngIf="assessments.length === 0" style="color:#94a3b8;padding:1rem;background:white;border-radius:8px;">No upcoming assessments.</div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div *ngFor="let a of assessments" style="background:white;border-radius:10px;padding:1rem;border:1px solid #e2e8f0;display:flex;justify-content:space-between;">
            <div>
              <div style="font-weight:700;color:#1e293b;">{{ a.title }}</div>
              <div style="font-size:0.8rem;color:#64748b;">{{ a.courseName }} - {{ a.type }}</div>
            </div>
            <div style="font-size:0.8rem;color:#6366f1;font-weight:600;">{{ a.startDate }}</div>
          </div>
        </div>
      </div>
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">Class Schedule</h2>
        <div *ngIf="schedules.length === 0" style="color:#94a3b8;padding:1rem;background:white;border-radius:8px;">No schedules.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">
          <div *ngFor="let s of schedules" style="background:white;border-radius:10px;padding:1rem;border:1px solid #e2e8f0;border-left:4px solid #6366f1;">
            <div style="font-weight:700;color:#1e293b;">{{ s.dayOfWeek }}</div>
            <div style="font-size:0.8rem;color:#64748b;">{{ s.startTime }} - {{ s.endTime }}</div>
            <div style="font-size:0.8rem;color:#64748b;">Room {{ s.room }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParentPlanningPage implements OnInit {
  assessments: any[] = [];
  schedules: any[] = [];
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    const now = Date.now();
    this.http.get<any[]>(this.api + '/api/assessments').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.assessments = (d || []).filter((a: any) => a.status === 'PUBLISHED' && a.startDate && new Date(a.startDate).getTime() > now);
    });
    this.http.get<any[]>(this.api + '/api/schedules').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.schedules = d || [];
    });
  }
}
