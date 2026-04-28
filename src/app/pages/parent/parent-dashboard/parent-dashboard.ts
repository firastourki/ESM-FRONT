import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Header -->
    <div style="margin-bottom:1.75rem;">
      <h1 style="font-size:1.5rem;font-weight:700;color:#1e293b;margin:0 0 0.25rem;">Parent Dashboard</h1>
      <p style="color:#64748b;margin:0;">Manage your children's accounts and wallets</p>
    </div>

    <!-- Loading -->
    @if (loading) {
      <div style="text-align:center;padding:4rem;color:#64748b;">
        <div style="width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 1rem;"></div>
        Loading children…
      </div>
    }

    <!-- No children -->
    @if (!loading && children.length === 0) {
      <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:14px;padding:3rem;text-align:center;color:#94a3b8;margin-bottom:2rem;">
        <div style="font-size:3rem;margin-bottom:0.75rem;">👨‍👧‍👦</div>
        <div style="font-weight:600;color:#64748b;margin-bottom:0.25rem;">No children linked</div>
        <div style="font-size:0.85rem;">Ask an administrator to link your children to your account.</div>
      </div>
    }

    <!-- Children cards -->
    @if (!loading && children.length > 0) {
      <div style="margin-bottom:0.75rem;font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">
        My Children ({{ children.length }})
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1.5rem;margin-bottom:2.5rem;">
        @for (child of children; track child.id) {
          <div style="background:white;border-radius:16px;padding:1.5rem;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <!-- Avatar + name -->
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
              <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;color:white;flex-shrink:0;">
                {{ (child.firstName || '?')[0].toUpperCase() }}
              </div>
              <div>
                <div style="font-weight:700;color:#1e293b;font-size:1rem;margin-bottom:4px;">{{ child.firstName }} {{ child.lastName }}</div>
                <span style="background:#ede9fe;color:#7c3aed;padding:2px 10px;border-radius:99px;font-size:0.72rem;font-weight:700;">
                  {{ child.className || 'No class' }}
                </span>
              </div>
            </div>
            <!-- Wallet balance -->
            <div style="background:#f8fafc;border-radius:10px;padding:0.875rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:0.8rem;color:#64748b;">Wallet Balance</span>
              <span style="font-size:1.2rem;font-weight:800;color:#6366f1;">{{ child.walletBalance | number:'1.0-2' }} TND</span>
            </div>
            <!-- Top-up button -->
            <button (click)="openTopup(child)"
              style="width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:0.65rem;border-radius:10px;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;">
              + Top-Up Wallet
            </button>
          </div>
        }
      </div>
    }

    <!-- Quick navigation -->
    <div style="margin-bottom:0.75rem;font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">Quick Access</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1rem;">
      <a routerLink="/parent/grades" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:0.875rem;">
        <span style="font-size:1.75rem;">🏆</span>
        <div><div style="font-weight:700;color:#1e293b;font-size:0.9rem;">Grades</div><div style="font-size:0.75rem;color:#64748b;">Academic performance</div></div>
      </a>
      <a routerLink="/parent/planning" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:0.875rem;">
        <span style="font-size:1.75rem;">📅</span>
        <div><div style="font-weight:700;color:#1e293b;font-size:0.9rem;">Planning</div><div style="font-size:0.75rem;color:#64748b;">Exams & schedules</div></div>
      </a>
      <a routerLink="/parent/payments" style="background:white;border-radius:12px;padding:1.25rem;border:1px solid #e2e8f0;text-decoration:none;display:flex;align-items:center;gap:0.875rem;">
        <span style="font-size:1.75rem;">💳</span>
        <div><div style="font-weight:700;color:#1e293b;font-size:0.9rem;">Payments</div><div style="font-size:0.75rem;color:#64748b;">History & top-up</div></div>
      </a>
    </div>

    <!-- Success toast -->
    @if (successMessage) {
      <div style="position:fixed;bottom:2rem;right:2rem;background:#22c55e;color:white;padding:0.875rem 1.25rem;border-radius:10px;font-size:0.875rem;font-weight:600;box-shadow:0 4px 16px rgba(34,197,94,0.4);z-index:999;">
        ✓ {{ successMessage }}
      </div>
    }

    <!-- Top-Up Modal -->
    @if (showTopupModal && selectedChild) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;">
        <div style="background:white;border-radius:16px;padding:2rem;width:100%;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
          <h2 style="font-size:1.2rem;font-weight:700;color:#1e293b;margin-bottom:0.25rem;">💳 Top-Up Wallet</h2>
          <p style="font-size:0.8rem;color:#64748b;margin-bottom:1.5rem;">
            Adding funds to <strong>{{ selectedChild.firstName }} {{ selectedChild.lastName }}</strong>'s account.
          </p>

          @if (topupError) {
            <div style="background:#fee2e2;color:#dc2626;padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;font-size:0.875rem;">
              ⚠ {{ topupError }}
            </div>
          }

          <div style="background:#f8fafc;border-radius:10px;padding:1rem;margin-bottom:1.25rem;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.8rem;color:#64748b;">Current balance</span>
            <span style="font-size:1.1rem;font-weight:800;color:#6366f1;">{{ selectedChild.walletBalance | number:'1.0-2' }} TND</span>
          </div>

          <div style="margin-bottom:1.75rem;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Amount to add (TND) *</label>
            <input type="number" [(ngModel)]="topupAmount" min="1" placeholder="e.g. 100"
              style="width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:0.65rem 0.75rem;font-size:1rem;outline:none;box-sizing:border-box;" />
            <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
              @for (q of [50, 100, 200, 300]; track q) {
                <button type="button" (click)="topupAmount = q"
                  style="flex:1;padding:5px;border-radius:6px;font-size:0.75rem;font-weight:700;cursor:pointer;border:1.5px solid #e2e8f0;background:white;color:#374151;">
                  {{ q }}
                </button>
              }
            </div>
          </div>

          <div style="display:flex;gap:0.75rem;">
            <button (click)="confirmTopup()" [disabled]="submitting"
              style="flex:1;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:0.75rem;border-radius:10px;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;"
              [style.opacity]="submitting ? '0.7' : '1'">
              {{ submitting ? 'Processing…' : 'Add Funds' }}
            </button>
            <button (click)="closeTopup()"
              style="padding:0.75rem 1.5rem;border-radius:10px;background:#f1f5f9;color:#374151;font-size:0.875rem;font-weight:600;border:none;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    }

    <style>
    @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `
})
export class ParentDashboard implements OnInit {
  children: any[] = [];
  loading = true;
  selectedChild: any = null;
  showTopupModal = false;
  topupAmount: number | null = null;
  topupError = '';
  submitting = false;
  successMessage = '';

  private api = environment.apiUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.api}/api/parents/me/children`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.children = data || [];
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  openTopup(child: any): void {
    this.selectedChild = { ...child };
    this.topupAmount = null;
    this.topupError = '';
    this.showTopupModal = true;
    this.cdr.detectChanges();
  }

  closeTopup(): void {
    this.showTopupModal = false;
    this.selectedChild = null;
    this.cdr.detectChanges();
  }

  confirmTopup(): void {
    if (!this.topupAmount || this.topupAmount <= 0) {
      this.topupError = 'Please enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    this.submitting = true;
    this.topupError = '';
    this.cdr.detectChanges();

    this.http.put<any>(`${this.api}/api/users/${this.selectedChild.id}/wallet/topup`, { amount: this.topupAmount }).pipe(
      catchError(err => {
        this.submitting = false;
        this.topupError = err?.error?.message || 'Top-up failed. Please try again.';
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        const newBalance = result.walletBalance ?? (this.selectedChild.walletBalance + (this.topupAmount ?? 0));
        const childInList = this.children.find(c => c.id === this.selectedChild.id);
        if (childInList) childInList.walletBalance = newBalance;
        const childName = this.selectedChild.firstName;
        const addedAmount = this.topupAmount;
        this.submitting = false;
        this.showTopupModal = false;
        this.selectedChild = null;
        this.topupAmount = null;
        this.successMessage = `Added ${addedAmount} TND to ${childName}'s wallet!`;
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
        this.cdr.detectChanges();
      }
    });
  }
}
