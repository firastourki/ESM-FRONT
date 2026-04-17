$app = "C:\Users\Firas\Pidev\esm-front\src\app"

# ── Créer tous les dossiers ────────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path "$app\layout\parent-layout" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\student\student-courses" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\student\student-attendance" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\student\student-assessments" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\student\student-schedule" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\parent\parent-dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\parent\parent-grades" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\parent\parent-planning" | Out-Null
New-Item -ItemType Directory -Force -Path "$app\pages\parent\parent-payments" | Out-Null

Write-Host "Dossiers créés ✅"

# ── Student Layout ─────────────────────────────────────────────────────────────
@"
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-layout.html',
  styleUrls: ['./student-layout.css']
})
export class StudentLayout {}
"@ | Out-File -FilePath "$app\layout\student-layout\student-layout.ts" -Encoding UTF8

@"
<div class="student-shell">
  <aside class="sidebar">
    <div class="logo">🎓 Student</div>
    <nav>
      <a routerLink="/student/home" routerLinkActive="active">🏠 Dashboard</a>
      <a routerLink="/student/courses" routerLinkActive="active">📚 My Courses</a>
      <a routerLink="/student/attendance" routerLinkActive="active">✅ Attendance</a>
      <a routerLink="/student/grades" routerLinkActive="active">🏆 My Grades</a>
      <a routerLink="/student/assessments" routerLinkActive="active">📝 Assessments</a>
      <a routerLink="/student/leaderboard" routerLinkActive="active">🥇 Leaderboard</a>
      <a routerLink="/student/schedule" routerLinkActive="active">🗓️ Schedule</a>
    </nav>
    <a routerLink="/" class="back-link">← Home</a>
  </aside>
  <div class="main">
    <header class="header">
      <span>Student Portal</span>
      <span>👤 Student</span>
    </header>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
"@ | Out-File -FilePath "$app\layout\student-layout\student-layout.html" -Encoding UTF8

@"
.student-shell { display:flex; min-height:100vh; background:#f8fafc; font-family:'Inter',sans-serif; }
.sidebar { width:220px; background:#1e293b; color:white; display:flex; flex-direction:column; padding:1.5rem 0; flex-shrink:0; }
.logo { padding:0 1.5rem 1.5rem; font-size:1.2rem; font-weight:800; border-bottom:1px solid #334155; }
nav { padding:1rem 0; flex:1; display:flex; flex-direction:column; }
nav a { display:flex; align-items:center; gap:10px; padding:10px 1.5rem; color:#cbd5e1; text-decoration:none; font-size:0.875rem; transition:all 0.2s; }
nav a:hover, nav a.active { background:#334155; color:#f8fafc; border-left:3px solid #6366f1; }
.back-link { padding:1rem 1.5rem; color:#94a3b8; font-size:0.8rem; text-decoration:none; border-top:1px solid #334155; }
.main { flex:1; display:flex; flex-direction:column; }
.header { background:white; padding:1rem 2rem; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:0.875rem; }
.content { flex:1; padding:2rem; overflow-y:auto; }
"@ | Out-File -FilePath "$app\layout\student-layout\student-layout.css" -Encoding UTF8

Write-Host "Student Layout ✅"

# ── Parent Layout ──────────────────────────────────────────────────────────────
@"
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-layout.html',
  styleUrls: ['./parent-layout.css']
})
export class ParentLayout {}
"@ | Out-File -FilePath "$app\layout\parent-layout\parent-layout.ts" -Encoding UTF8

@"
<div class="parent-shell">
  <aside class="sidebar">
    <div class="logo">👨‍👩‍👧 Parent</div>
    <nav>
      <a routerLink="/parent/dashboard" routerLinkActive="active">🏠 Dashboard</a>
      <a routerLink="/parent/grades" routerLinkActive="active">🏆 Child Grades</a>
      <a routerLink="/parent/planning" routerLinkActive="active">📅 Planning</a>
      <a routerLink="/parent/payments" routerLinkActive="active">💳 Payments</a>
    </nav>
    <a routerLink="/" class="back-link">← Home</a>
  </aside>
  <div class="main">
    <header class="header">
      <span>Parent Portal</span>
      <span>👤 Parent</span>
    </header>
    <main class="content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
"@ | Out-File -FilePath "$app\layout\parent-layout\parent-layout.html" -Encoding UTF8

@"
.parent-shell { display:flex; min-height:100vh; background:#f8fafc; font-family:'Inter',sans-serif; }
.sidebar { width:220px; background:#0f172a; color:white; display:flex; flex-direction:column; padding:1.5rem 0; flex-shrink:0; }
.logo { padding:0 1.5rem 1.5rem; font-size:1.2rem; font-weight:800; border-bottom:1px solid #1e293b; }
nav { padding:1rem 0; flex:1; display:flex; flex-direction:column; }
nav a { display:flex; align-items:center; gap:10px; padding:10px 1.5rem; color:#cbd5e1; text-decoration:none; font-size:0.875rem; transition:all 0.2s; }
nav a:hover, nav a.active { background:#1e293b; color:#f8fafc; border-left:3px solid #10b981; }
.back-link { padding:1rem 1.5rem; color:#94a3b8; font-size:0.8rem; text-decoration:none; border-top:1px solid #1e293b; }
.main { flex:1; display:flex; flex-direction:column; }
.header { background:white; padding:1rem 2rem; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; font-size:0.875rem; }
.content { flex:1; padding:2rem; overflow-y:auto; }
"@ | Out-File -FilePath "$app\layout\parent-layout\parent-layout.css" -Encoding UTF8

Write-Host "Parent Layout ✅"

# ── Student Courses ────────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">📚 My Courses</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
      <div *ngIf="!loading && courses.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No courses enrolled yet.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
        <div *ngFor="let c of courses" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="font-size:1rem;font-weight:700;color:#1e293b;">{{ c.title }}</div>
          <div style="font-size:0.8rem;color:#64748b;margin-top:4px;">{{ c.description }}</div>
          <span style="display:inline-block;margin-top:0.75rem;background:#ede9fe;color:#7c3aed;padding:3px 10px;border-radius:99px;font-size:0.75rem;font-weight:600;">{{ c.level || 'General' }}</span>
        </div>
      </div>
    </div>
  ``
})
export class StudentCoursesPage implements OnInit {
  courses: any[] = [];
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(`\${environment.apiUrl}/api/v1/courses`).pipe(catchError(() => of({ content: [] }))).subscribe(data => {
      this.courses = data?.content || data || [];
      this.loading = false;
    });
  }
}
"@ | Out-File -FilePath "$app\pages\student\student-courses\student-courses.ts" -Encoding UTF8

Write-Host "Student Courses ✅"

# ── Student Attendance ─────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">✅ My Attendance</h1>
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
        <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
        <table *ngIf="!loading && records.length > 0" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f8fafc;">
            <tr>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Date</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Status</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of records" style="border-top:1px solid #f1f5f9;">
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ r.date }}</td>
              <td style="padding:0.75rem 1rem;">
                <span [style.background]="r.status==='PRESENT'?'#dcfce7':r.status==='ABSENT'?'#fee2e2':'#fef3c7'"
                      [style.color]="r.status==='PRESENT'?'#15803d':r.status==='ABSENT'?'#dc2626':'#b45309'"
                      style="padding:2px 8px;border-radius:99px;font-size:0.75rem;font-weight:600;">{{ r.status }}</span>
              </td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;color:#64748b;">{{ r.note || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && records.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No attendance records.</div>
      </div>
    </div>
  ``
})
export class StudentAttendancePage implements OnInit {
  records: any[] = [];
  loading = true;
  present = 0; absent = 0; late = 0; total = 0;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`\${environment.apiUrl}/api/attendances`).pipe(catchError(() => of([]))).subscribe(data => {
      this.records = data || [];
      this.total = this.records.length;
      this.present = this.records.filter(r => r.status === 'PRESENT').length;
      this.absent = this.records.filter(r => r.status === 'ABSENT').length;
      this.late = this.records.filter(r => r.status === 'LATE').length;
      this.loading = false;
    });
  }
}
"@ | Out-File -FilePath "$app\pages\student\student-attendance\student-attendance.ts" -Encoding UTF8

Write-Host "Student Attendance ✅"

# ── Student Assessments ────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-assessments',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">📝 My Assessments</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
      <div *ngIf="!loading && assessments.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No published assessments.</div>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div *ngFor="let a of assessments" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:1rem;font-weight:700;color:#1e293b;">{{ a.title }}</div>
            <div style="font-size:0.8rem;color:#64748b;margin-top:4px;">{{ a.courseName }} · {{ a.type }}</div>
            <div *ngIf="a.startDate" style="font-size:0.78rem;color:#94a3b8;margin-top:2px;">📅 {{ a.startDate | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
          <div style="text-align:right;">
            <span style="background:#dcfce7;color:#15803d;padding:4px 12px;border-radius:99px;font-size:0.75rem;font-weight:700;">{{ a.status }}</span>
            <div *ngIf="a.duration" style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">⏱ {{ a.duration }} min</div>
          </div>
        </div>
      </div>
    </div>
  ``
})
export class StudentAssessmentsPage implements OnInit {
  assessments: any[] = [];
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`\${environment.apiUrl}/api/assessments`).pipe(catchError(() => of([]))).subscribe(data => {
      this.assessments = (data || []).filter((a: any) => a.status === 'PUBLISHED');
      this.loading = false;
    });
  }
}
"@ | Out-File -FilePath "$app\pages\student\student-assessments\student-assessments.ts" -Encoding UTF8

Write-Host "Student Assessments ✅"

# ── Student Schedule ───────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">🗓️ Class Schedule</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
      <div *ngIf="!loading && schedules.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No schedules found.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;">
        <div *ngFor="let s of schedules" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;border-left:4px solid #6366f1;">
          <div style="font-weight:700;color:#1e293b;margin-bottom:0.5rem;">{{ s.subject || 'Class' }}</div>
          <div style="font-size:0.8rem;color:#64748b;">📅 {{ s.dayOfWeek }}</div>
          <div style="font-size:0.8rem;color:#64748b;">⏰ {{ s.startTime }} – {{ s.endTime }}</div>
          <div style="font-size:0.8rem;color:#64748b;">🏠 Room {{ s.room }}</div>
        </div>
      </div>
    </div>
  ``
})
export class StudentSchedulePage implements OnInit {
  schedules: any[] = [];
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`\${environment.apiUrl}/api/schedules`).pipe(catchError(() => of([]))).subscribe(data => {
      this.schedules = data || [];
      this.loading = false;
    });
  }
}
"@ | Out-File -FilePath "$app\pages\student\student-schedule\student-schedule.ts" -Encoding UTF8

Write-Host "Student Schedule ✅"

# ── Parent Dashboard ───────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">👨‍👩‍👧 Parent Dashboard</h1>
      <p style="color:#64748b;margin-bottom:2rem;">Monitor your child's academic progress</p>
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
          <span style="font-size:2rem;">🏆</span>
          <div><div style="font-weight:700;color:#1e293b;">View Grades</div><div style="font-size:0.8rem;color:#64748b;">Academic performance</div></div>
        </a>
        <a routerLink="/parent/planning" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:1rem;">
          <span style="font-size:2rem;">📅</span>
          <div><div style="font-weight:700;color:#1e293b;">Planning</div><div style="font-size:0.8rem;color:#64748b;">Exams & schedules</div></div>
        </a>
        <a routerLink="/parent/payments" style="background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:1rem;">
          <span style="font-size:2rem;">💳</span>
          <div><div style="font-weight:700;color:#1e293b;">Payments</div><div style="font-size:0.8rem;color:#64748b;">Tuition & fees</div></div>
        </a>
      </div>
    </div>
  ``
})
export class ParentDashboard implements OnInit {
  totalAssessments = 0; pendingPayments = 0; totalGrades = 0;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`\${environment.apiUrl}/api/assessments`).pipe(catchError(() => of([]))).subscribe(data => {
      this.totalAssessments = (data || []).filter((a: any) => a.status === 'PUBLISHED').length;
    });
    this.http.get<any[]>(`\${environment.apiUrl}/api/payments`).pipe(catchError(() => of([]))).subscribe(data => {
      this.pendingPayments = (data || []).filter((p: any) => p.status === 'PENDING').length;
    });
    this.http.get<any[]>(`\${environment.apiUrl}/api/grades`).pipe(catchError(() => of([]))).subscribe(data => {
      this.totalGrades = (data || []).length;
    });
  }
}
"@ | Out-File -FilePath "$app\pages\parent\parent-dashboard\parent-dashboard.ts" -Encoding UTF8

Write-Host "Parent Dashboard ✅"

# ── Parent Grades ──────────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-parent-grades',
  standalone: true,
  imports: [CommonModule],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">🏆 Child Grades</h1>
      <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading grades...</div>
      <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
        <table *ngIf="!loading && grades.length > 0" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f8fafc;">
            <tr>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Assessment</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Score</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Max</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">%</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let g of grades" style="border-top:1px solid #f1f5f9;">
              <td style="padding:0.75rem 1rem;font-size:0.875rem;font-weight:600;">#{{ g.assessmentId }}</td>
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
  ``
})
export class ParentGradesPage implements OnInit {
  grades: any[] = [];
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`\${environment.apiUrl}/api/grades`).pipe(catchError(() => of([]))).subscribe(data => {
      this.grades = data || [];
      this.loading = false;
    });
  }
  getPct(g: any): number { return g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0; }
}
"@ | Out-File -FilePath "$app\pages\parent\parent-grades\parent-grades.ts" -Encoding UTF8

Write-Host "Parent Grades ✅"

# ── Parent Planning ────────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-parent-planning',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">📅 Planning</h1>
      <div style="margin-bottom:2rem;">
        <h2 style="font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:1rem;">📝 Upcoming Assessments</h2>
        <div *ngIf="assessments.length === 0" style="color:#94a3b8;font-size:0.875rem;padding:1rem;background:white;border-radius:8px;">No upcoming assessments.</div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div *ngFor="let a of assessments" style="background:white;border-radius:10px;padding:1rem;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:700;color:#1e293b;">{{ a.title }}</div>
              <div style="font-size:0.8rem;color:#64748b;">{{ a.courseName }} · {{ a.type }}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.8rem;color:#6366f1;font-weight:600;">{{ a.startDate | date:'dd/MM/yyyy' }}</div>
              <div style="font-size:0.75rem;color:#94a3b8;">{{ a.startDate | date:'HH:mm' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 style="font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:1rem;">🗓️ Class Schedule</h2>
        <div *ngIf="schedules.length === 0" style="color:#94a3b8;font-size:0.875rem;padding:1rem;background:white;border-radius:8px;">No schedules found.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;">
          <div *ngFor="let s of schedules" style="background:white;border-radius:10px;padding:1rem;border:1px solid #e2e8f0;border-left:4px solid #6366f1;">
            <div style="font-weight:700;color:#1e293b;">{{ s.dayOfWeek }}</div>
            <div style="font-size:0.8rem;color:#64748b;">⏰ {{ s.startTime }} – {{ s.endTime }}</div>
            <div style="font-size:0.8rem;color:#64748b;">🏠 Room {{ s.room }}</div>
          </div>
        </div>
      </div>
    </div>
  ``
})
export class ParentPlanningPage implements OnInit {
  assessments: any[] = [];
  schedules: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit() {
    const now = Date.now();
    this.http.get<any[]>(`\${environment.apiUrl}/api/assessments`).pipe(catchError(() => of([]))).subscribe(data => {
      this.assessments = (data || []).filter((a: any) => a.status === 'PUBLISHED' && a.startDate && new Date(a.startDate).getTime() > now);
    });
    this.http.get<any[]>(`\${environment.apiUrl}/api/schedules`).pipe(catchError(() => of([]))).subscribe(data => {
      this.schedules = data || [];
    });
  }
}
"@ | Out-File -FilePath "$app\pages\parent\parent-planning\parent-planning.ts" -Encoding UTF8

Write-Host "Parent Planning ✅"

# ── Parent Payments ────────────────────────────────────────────────────────────
@"
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: ``
    <div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin-bottom:1.5rem;">💳 Payments</h1>
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
        <div *ngIf="loading" style="text-align:center;padding:3rem;color:#64748b;">Loading...</div>
        <table *ngIf="!loading && payments.length > 0" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f8fafc;">
            <tr>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">ID</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Amount</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Method</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Date</th>
              <th style="padding:0.75rem 1rem;text-align:left;font-size:0.75rem;color:#64748b;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments" style="border-top:1px solid #f1f5f9;">
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">#{{ p.paymentId }}</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;font-weight:600;">{{ p.amount }} TND</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ p.method }}</td>
              <td style="padding:0.75rem 1rem;font-size:0.875rem;">{{ p.date | date:'dd/MM/yyyy' }}</td>
              <td style="padding:0.75rem 1rem;">
                <span [style.background]="p.status==='PAID'?'#dcfce7':p.status==='PENDING'?'#fef3c7':'#fee2e2'"
                      [style.color]="p.status==='PAID'?'#15803d':p.status==='PENDING'?'#b45309':'#dc2626'"
                      style="padding:2px 10px;border-radius:99px;font-size:0.75rem;font-weight:700;">{{ p.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && payments.length === 0" style="text-align:center;padding:3rem;color:#94a3b8;">No payments found.</div>
      </div>
    </div>
  ``
})
export class ParentPaymentsPage implements OnInit {
  payments: any[] = [];
  loading = true;
  total = 0; paid = 0; pending = 0;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>(`\${environment.apiUrl}/api/payments`).pipe(catchError(() => of([]))).subscribe(data => {
      this.payments = data || [];
      this.total = this.payments.length;
      this.paid = this.payments.filter(p => p.status === 'PAID').length;
      this.pending = this.payments.filter(p => p.status === 'PENDING').length;
      this.loading = false;
    });
  }
}
"@ | Out-File -FilePath "$app\pages\parent\parent-payments\parent-payments.ts" -Encoding UTF8

Write-Host "Parent Payments ✅"

# ── Supprimer doublons pages/student/student-home si déjà dans student ────────
# On garde student-home dans pages/student/student-home/ (déjà existant)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TOUT EST CRÉÉ ! Lance: ng serve" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
