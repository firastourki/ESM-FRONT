import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">Parent Dashboard</h1>
      <p style="color:#64748b;margin-bottom:2rem;">Monitor your child academic progress</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-bottom:2rem;">
        <div style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;border-left:4px solid #6366f1;text-align:center;">
          <div style="font-size:2rem;font-weight:800;color:#6366f1;">{{ totalAssessments }}</div>
          <div style="font-size:0.875rem;color:#64748b;">Assessments</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;text-align:center;">
          <div style="font-size:2rem;font-weight:800;color:#f59e0b;">{{ pendingPayments }}</div>
          <div style="font-size:0.875rem;color:#64748b;">Pending Payments</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;border-left:4px solid #22c55e;text-align:center;">
          <div style="font-size:2rem;font-weight:800;color:#22c55e;">{{ totalGrades }}</div>
          <div style="font-size:0.875rem;color:#64748b;">Grades</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem;">
        <a routerLink="/parent/grades" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:1rem;">
          <span style="font-size:2rem;">&#127942;</span>
          <div><div style="font-weight:700;color:#1e293b;">Grades</div><div style="font-size:0.8rem;color:#64748b;">Academic performance</div></div>
        </a>
        <a routerLink="/parent/planning" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:1rem;">
          <span style="font-size:2rem;">&#128197;</span>
          <div><div style="font-weight:700;color:#1e293b;">Planning</div><div style="font-size:0.8rem;color:#64748b;">Exams and schedules</div></div>
        </a>
        <a routerLink="/parent/payments" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:1rem;">
          <span style="font-size:2rem;">&#128179;</span>
          <div><div style="font-weight:700;color:#1e293b;">Payments</div><div style="font-size:0.8rem;color:#64748b;">Tuition and fees</div></div>
        </a>
      </div>
    </div>
  `
})
export class ParentDashboard implements OnInit {
  totalAssessments = 0; pendingPayments = 0; totalGrades = 0;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(this.api + '/api/assessments').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.totalAssessments = (d || []).filter((a: any) => a.status === 'PUBLISHED').length;
    });
    this.http.get<any[]>(this.api + '/api/payments').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.pendingPayments = (d || []).filter((p: any) => p.status === 'PENDING').length;
    });
    this.http.get<any[]>(this.api + '/api/grades').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.totalGrades = (d || []).length;
    });
  }
}
