import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parent-payments.html'
})
export class ParentPaymentsPage implements OnInit {
  children: any[] = [];
  selectedChild: any = null;
  loadingChildren = true;

  payments: any[] = [];
  loading = false;
  showForm = false;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  walletBalance = 0;
  topupAmount: number | null = null;

  private api = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.loadingChildren = true;
    this.http.get<any[]>(`${this.api}/api/parents/me/children`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.children = data || [];
      this.loadingChildren = false;
      if (this.children.length === 1) {
        this.selectChild(this.children[0]);
      }
      this.cdr.detectChanges();
    });
  }

  selectChild(child: any): void {
    this.selectedChild = child;
    this.walletBalance = child.walletBalance ?? 0;
    this.payments = [];
    this.errorMessage = '';
    this.loadPayments(child.email);
    this.cdr.detectChanges();
  }

  onChildChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const child = this.children.find(c => c.id === id);
    if (child) this.selectChild(child);
  }

  loadPayments(email: string): void {
    this.loading = true;
    this.http.get<any[]>(`${this.api}/api/payments/by-student-email/${encodeURIComponent(email)}`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.payments = data || [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  refreshWallet(): void {
    if (!this.selectedChild?.id) return;
    this.http.get<any>(`${this.api}/api/users/${this.selectedChild.id}/wallet`).pipe(
      catchError(() => of(null))
    ).subscribe(w => {
      if (w?.walletBalance !== undefined) {
        this.walletBalance = w.walletBalance;
        if (this.selectedChild) this.selectedChild.walletBalance = w.walletBalance;
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
    if (!this.selectedChild?.id) {
      this.errorMessage = 'Please select a child first.';
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.put<any>(`${this.api}/api/users/${this.selectedChild.id}/wallet/topup`, { amount: this.topupAmount }).pipe(
      catchError(err => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Top-up failed. Please try again.';
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        this.walletBalance = result.walletBalance ?? this.walletBalance + (this.topupAmount ?? 0);
        if (this.selectedChild) this.selectedChild.walletBalance = this.walletBalance;
        this.submitting = false;
        this.showForm = false;
        this.successMessage = `Successfully added ${this.topupAmount} TND to ${this.selectedChild.firstName}'s wallet!`;
        this.loadPayments(this.selectedChild.email);
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
