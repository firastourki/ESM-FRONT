import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-student-assessments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">My Assessments</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
      <div *ngIf="!loading && assessments.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No assessments.</div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div *ngFor="let a of assessments" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:1rem;font-weight:700;color:#1e293b;">{{ a.title }}</div>
            <div style="font-size:0.8rem;color:#64748b;margin-top:4px;">{{ a.courseName }} - {{ a.type }}</div>
          </div>
          <span style="background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:99px;font-size:0.75rem;font-weight:700;">{{ a.status }}</span>
        </div>
      </div>
    </div>
  `
})
export class StudentAssessmentsPage implements OnInit {
  assessments: any[] = [];
  loading = true;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(this.api + '/api/assessments').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.assessments = (d || []).filter((a: any) => a.status === 'PUBLISHED');
      this.loading = false;
    });
  }
}
