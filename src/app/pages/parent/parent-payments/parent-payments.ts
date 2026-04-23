import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-payments.html'
})
export class ParentPaymentsPage implements OnInit {
  payments: any[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  childEmail = '';
  childId = '';
  walletBalance = 0;
  loadingWallet = false;

  topupAmount: number | null = null;

  private api = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.childEmail = localStorage.getItem('parent_child_email') || '';
    if (this.childEmail) {
      this.resolveChildAndLoad();
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  resolveChildAndLoad(): void {
    this.loadingWallet = true;
    this.http.get<any>(`${this.api}/api/users?email=${encodeURIComponent(this.childEmail)}&size=1`).pipe(
      catchError(() => of(null))
    ).subscribe(page => {
      const child = page?.content?.[0] || null;
      if (child?.id) {
        this.childId = child.id;
        this.walletBalance = child.walletBalance ?? 0;
        this.loadPayments(child.id);
      } else {
        this.loading = false;
        this.loadingWallet = false;
        this.errorMessage = 'Child not found. Please update the email in the dashboard.';
      }
      this.loadingWallet = false;
      this.cdr.detectChanges();
    });
  }

  loadPayments(studentId: string): void {
    this.loading = true;
    this.http.get<any[]>(`${this.api}/api/payments/by-student/${studentId}`).pipe(
      catchError(() => this.http.get<any[]>(`${this.api}/api/payments`).pipe(catchError(() => of([]))))
    ).subscribe(data => {
      this.payments = data || [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  refreshWallet(): void {
    if (!this.childId) return;
    this.http.get<any>(`${this.api}/api/users/${this.childId}/wallet`).pipe(
      catchError(() => of(null))
    ).subscribe(w => {
      if (w?.walletBalance !== undefined) {
        this.walletBalance = w.walletBalance;
        this.cdr.detectChanges();
      }
    });
  }

  openForm(): void {
    this.topupAmount = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.cdr.detectChanges();
  }

  submitTopup(): void {
    if (!this.topupAmount || this.topupAmount <= 0) {
      this.errorMessage = 'Please enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.childId) {
      this.errorMessage = 'Child account not found.';
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.put<any>(`${this.api}/api/users/${this.childId}/wallet/topup`, { amount: this.topupAmount }).pipe(
      catchError(err => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Top-up failed. Please try again.';
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        this.walletBalance = result.walletBalance ?? this.walletBalance + (this.topupAmount ?? 0);
        this.submitting = false;
        this.showForm = false;
        this.successMessage = `Successfully added ${this.topupAmount} TND to your child's wallet!`;
        this.loadPayments(this.childId);
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }

  get total(): number { return this.payments.length; }
  get paid(): number { return this.payments.filter(p => p.status === 'PAID').length; }
  get pending(): number { return this.payments.filter(p => p.status === 'PENDING').length; }
  get totalAmount(): number {
    return this.payments.filter(p => p.status === 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  }

  statusBg(s: string): string {
    return s === 'PAID' ? '#dcfce7' : s === 'PENDING' ? '#fef3c7' : '#fee2e2';
  }
  statusColor(s: string): string {
    return s === 'PAID' ? '#15803d' : s === 'PENDING' ? '#b45309' : '#dc2626';
  }
}
