$app = "C:\Users\Firas\Pidev\esm-front\src\app"

# ── student-courses ────────────────────────────────────────────────────────────
$content = @'
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
'@
Set-Content "$app\pages\student\student-courses\student-courses.ts" $content -Encoding UTF8
Write-Host "student-courses.ts corrige"

# ── student-attendance ─────────────────────────────────────────────────────────
$content = @'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">My Attendance</h1>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem;">
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#22c55e;">{{ present }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Present</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#ef4444;">{{ absent }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Absent</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#f59e0b;">{{ late }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Late</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#6366f1;">{{ total }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Total</div>
        </div>
      </div>
      <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <div *ngIf="loading" style="text-align:center;padding:3rem;">Loading...</div>
        <table *ngIf="!loading && records.length > 0" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f8fafc;"><tr>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Date</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Status</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let r of records" style="border-top:1px solid #f1f5f9;">
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ r.date }}</td>
              <td style="padding:0.75rem 1rem;">
                <span [style.background]="r.status==='PRESENT'?'#dcfce7':r.status==='ABSENT'?'#fee2e2':'#fef3c7'"
                      [style.color]="r.status==='PRESENT'?'#15803d':r.status==='ABSENT'?'#dc2626':'#b45309'"
                      style="padding:2px 8px;border-radius:99px;font-size:0.75rem;font-weight:600;">{{ r.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && records.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No records.</div>
      </div>
    </div>
  `
})
export class StudentAttendancePage implements OnInit {
  records: any[] = [];
  loading = true;
  present = 0; absent = 0; late = 0; total = 0;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(this.api + '/api/attendances').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.records = d || [];
      this.total = this.records.length;
      this.present = this.records.filter((r: any) => r.status === 'PRESENT').length;
      this.absent = this.records.filter((r: any) => r.status === 'ABSENT').length;
      this.late = this.records.filter((r: any) => r.status === 'LATE').length;
      this.loading = false;
    });
  }
}
'@
Set-Content "$app\pages\student\student-attendance\student-attendance.ts" $content -Encoding UTF8
Write-Host "student-attendance.ts corrige"

# ── student-assessments ────────────────────────────────────────────────────────
$content = @'
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
'@
Set-Content "$app\pages\student\student-assessments\student-assessments.ts" $content -Encoding UTF8
Write-Host "student-assessments.ts corrige"

# ── student-schedule ───────────────────────────────────────────────────────────
$content = @'
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
'@
Set-Content "$app\pages\student\student-schedule\student-schedule.ts" $content -Encoding UTF8
Write-Host "student-schedule.ts corrige"

# ── parent-dashboard ───────────────────────────────────────────────────────────
$content = @'
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
'@
Set-Content "$app\pages\parent\parent-dashboard\parent-dashboard.ts" $content -Encoding UTF8
Write-Host "parent-dashboard.ts corrige"

# ── parent-grades ──────────────────────────────────────────────────────────────
$content = @'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-parent-grades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">Child Grades</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading grades...</div>
      <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <table *ngIf="!loading && grades.length > 0" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f8fafc;"><tr>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Assessment</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Score</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Max</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Pct</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Result</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let g of grades" style="border-top:1px solid #f1f5f9;">
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">#{{ g.assessmentId }}</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ g.score }}</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ g.maxScore }}</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;font-weight:700;">{{ getPct(g) }}%</td>
              <td style="padding:0.75rem 1rem;">
                <span [style.background]="getPct(g)>=50?'#dcfce7':'#fee2e2'"
                      [style.color]="getPct(g)>=50?'#15803d':'#dc2626'"
                      style="padding:2px 10px;border-radius:99px;font-size:0.75rem;font-weight:700;">
                  {{ getPct(g) >= 50 ? 'PASS' : 'FAIL' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && grades.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No grades yet.</div>
      </div>
    </div>
  `
})
export class ParentGradesPage implements OnInit {
  grades: any[] = [];
  loading = true;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(this.api + '/api/grades').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.grades = d || [];
      this.loading = false;
    });
  }
  getPct(g: any): number { return g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0; }
}
'@
Set-Content "$app\pages\parent\parent-grades\parent-grades.ts" $content -Encoding UTF8
Write-Host "parent-grades.ts corrige"

# ── parent-planning ────────────────────────────────────────────────────────────
$content = @'
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
'@
Set-Content "$app\pages\parent\parent-planning\parent-planning.ts" $content -Encoding UTF8
Write-Host "parent-planning.ts corrige"

# ── parent-payments ────────────────────────────────────────────────────────────
$content = @'
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">Payments</h1>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#1e293b;">{{ total }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Total</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#22c55e;">{{ paid }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Paid</div>
        </div>
        <div style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-align:center;">
          <div style="font-size:1.75rem;font-weight:800;color:#f59e0b;">{{ pending }}</div>
          <div style="font-size:0.8rem;color:#64748b;">Pending</div>
        </div>
      </div>
      <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <div *ngIf="loading" style="text-align:center;padding:3rem;">Loading...</div>
        <table *ngIf="!loading && payments.length > 0" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f8fafc;"><tr>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">ID</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Amount</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Method</th>
            <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Status</th>
          </tr></thead>
          <tbody>
            <tr *ngFor="let p of payments" style="border-top:1px solid #f1f5f9;">
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">#{{ p.paymentId }}</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;font-weight:600;">{{ p.amount }} TND</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ p.method }}</td>
              <td style="padding:0.75rem 1rem;">
                <span [style.background]="p.status==='PAID'?'#dcfce7':p.status==='PENDING'?'#fef3c7':'#fee2e2'"
                      [style.color]="p.status==='PAID'?'#15803d':p.status==='PENDING'?'#b45309':'#dc2626'"
                      style="padding:2px 10px;border-radius:99px;font-size:0.75rem;font-weight:700;">{{ p.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && payments.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No payments.</div>
      </div>
    </div>
  `
})
export class ParentPaymentsPage implements OnInit {
  payments: any[] = [];
  loading = true;
  total = 0; paid = 0; pending = 0;
  private api = 'http://localhost:8080';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(this.api + '/api/payments').pipe(catchError(() => of([]))).subscribe((d: any) => {
      this.payments = d || [];
      this.total = this.payments.length;
      this.paid = this.payments.filter((p: any) => p.status === 'PAID').length;
      this.pending = this.payments.filter((p: any) => p.status === 'PENDING').length;
      this.loading = false;
    });
  }
}
'@
Set-Content "$app\pages\parent\parent-payments\parent-payments.ts" $content -Encoding UTF8
Write-Host "parent-payments.ts corrige"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TOUS LES FICHIERS CORRIGES !" -ForegroundColor Green
Write-Host "  Lance: ng serve" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
