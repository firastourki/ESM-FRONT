import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:0.25rem;">Parent Dashboard</h1>
      <p style="color:#64748b;margin-bottom:1.5rem;">Monitor your child's academic progress</p>

      <!-- Child email config -->
      <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;margin-bottom:1.5rem;">
        <div style="font-size:0.85rem;font-weight:700;color:#374151;margin-bottom:0.75rem;">Child's student email</div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
          <input type="email" [(ngModel)]="childEmailInput" placeholder="student@school.com"
            style="flex:1;min-width:200px;border:1.5px solid #e2e8f0;border-radius:8px;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none;" />
          <button (click)="saveChildEmail()"
            style="padding:0.55rem 1.25rem;background:#6366f1;color:white;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;">
            Save
          </button>
        </div>
        @if (childEmail) {
          <div style="margin-top:0.5rem;font-size:0.78rem;color:#22c55e;">✓ Monitoring: {{ childEmail }}</div>
        }
      </div>

      <!-- Stats -->
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

      <!-- Navigation cards -->
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
          <div><div style="font-weight:700;color:#1e293b;">Payments & Wallet</div><div style="font-size:0.8rem;color:#64748b;">Top up child wallet</div></div>
        </a>
      </div>
    </div>
  `
})
export class ParentDashboard implements OnInit {
  totalAssessments = 0;
  pendingPayments = 0;
  totalGrades = 0;
  childEmail = '';
  childEmailInput = '';
  private api = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.childEmail = localStorage.getItem('parent_child_email') || '';
    this.childEmailInput = this.childEmail;
    this.loadStats();
  }

  saveChildEmail(): void {
    if (!this.childEmailInput.trim()) return;
    this.childEmail = this.childEmailInput.trim();
    localStorage.setItem('parent_child_email', this.childEmail);
    this.loadStats();
    this.cdr.detectChanges();
  }

  loadStats(): void {
    const email = this.childEmail;

    forkJoin({
      assessments: this.http.get<any[]>(`${this.api}/api/assessments`).pipe(catchError(() => of([]))),
      grades: email
        ? this.http.get<any[]>(`${this.api}/api/grades/student/${encodeURIComponent(email)}`).pipe(catchError(() => of([])))
        : this.http.get<any[]>(`${this.api}/api/grades`).pipe(catchError(() => of([]))),
      payments: this.http.get<any[]>(`${this.api}/api/payments`).pipe(catchError(() => of([])))
    }).subscribe(({ assessments, grades, payments }) => {
      this.totalAssessments = (assessments || []).filter((a: any) => a.status === 'PUBLISHED').length;
      this.totalGrades = (grades || []).length;
      this.pendingPayments = (payments || []).filter((p: any) => p.status === 'PENDING').length;
      this.cdr.detectChanges();
    });
  }
}
