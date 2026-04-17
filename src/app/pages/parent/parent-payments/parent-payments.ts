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
