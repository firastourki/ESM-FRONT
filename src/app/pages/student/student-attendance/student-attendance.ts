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
