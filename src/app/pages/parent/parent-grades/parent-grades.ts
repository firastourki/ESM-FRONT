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
