import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">Class Schedule</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
      <div *ngIf="!loading && schedules.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No schedules.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;">
        <div *ngFor="let s of schedules" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;border-left:4px solid #6366f1;">
          <div style="font-weight:700;color:#1e293b;margin-bottom:0.5rem;">{{ s.subject || 'Class' }}</div>
          <div style="font-size:0.8rem;color:#64748b;">{{ s.dayOfWeek }}</div>
          <div style="font-size:0.8rem;color:#64748b;">{{ s.startTime }} - {{ s.endTime }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Room {{ s.room }}</div>
        </div>
      </div>
    </div>
  `
})
export class StudentSchedulePage implements OnInit {
  schedules: any[] = [];
  loading = true;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(this.api + '/api/schedules').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.schedules = d || [];
      this.loading = false;
    });
  }
}
