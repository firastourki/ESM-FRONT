import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ParentService } from '../../core/services/parent.service';
import { UserService, UserResponseDto } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-parents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-parents.html'
})
export class AdminParents implements OnInit {
  private parentService = inject(ParentService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  parents: UserResponseDto[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  errorMessage = '';

  // ── Create ────────────────────────────────────────────────────────────────
  showCreateModal = false;
  createForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['']
  });

  // ── Edit ──────────────────────────────────────────────────────────────────
  showEditModal = false;
  editingId: string | null = null;
  editForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: [''],
    address: ['']
  });

  // ── Manage Children ───────────────────────────────────────────────────────
  showChildrenModal = false;
  managedParent: UserResponseDto | null = null;
  children: UserResponseDto[] = [];
  childrenLoading = false;

  childSearch = '';
  childResults: UserResponseDto[] = [];
  childSearching = false;

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents(page: number = this.pageIndex): void {
    this.loading = true;
    this.errorMessage = '';
    this.parentService.listParents(page, this.pageSize).subscribe({
      next: (p) => {
        this.parents = p.content;
        this.totalElements = p.totalElements;
        this.pageIndex = p.number;
        this.pageSize = p.size;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = `Failed to load parents: ${err?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  get totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(this.totalElements / this.pageSize) : 0;
  }

  prevPage(): void { if (this.pageIndex > 0) this.loadParents(this.pageIndex - 1); }
  nextPage(): void { if (this.pageIndex < this.totalPages - 1) this.loadParents(this.pageIndex + 1); }

  // ── Create ────────────────────────────────────────────────────────────────
  openCreateModal(): void {
    this.createForm.reset({ firstName: '', lastName: '', email: '', phoneNumber: '' });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
    this.showCreateModal = true;
  }

  closeCreateModal(): void { this.showCreateModal = false; }

  submitCreate(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    const v = this.createForm.value;
    this.parentService.createParent({
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phoneNumber: v.phoneNumber || undefined
    }).subscribe({
      next: () => { this.showCreateModal = false; this.loadParents(0); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to create parent'; }
    });
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  openEditModal(parent: UserResponseDto): void {
    this.editingId = parent.id;
    this.editForm.reset({
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      phoneNumber: parent.phoneNumber || '',
      address: parent.address || ''
    });
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.showEditModal = true;
  }

  closeEditModal(): void { this.showEditModal = false; this.editingId = null; }

  submitEdit(): void {
    if (this.editForm.invalid || !this.editingId) { this.editForm.markAllAsTouched(); return; }
    const v = this.editForm.value;
    this.parentService.updateParent(this.editingId, {
      firstName: v.firstName,
      lastName: v.lastName,
      phoneNumber: v.phoneNumber || undefined,
      address: v.address || undefined
    }).subscribe({
      next: () => { this.showEditModal = false; this.editingId = null; this.loadParents(this.pageIndex); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update parent'; }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  deleteParent(parent: UserResponseDto): void {
    if (!confirm(`Delete parent account for ${parent.email}? All child links will be removed.`)) return;
    this.parentService.deleteParent(parent.id).subscribe({
      next: () => this.loadParents(this.pageIndex),
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to delete parent'; }
    });
  }

  // ── Manage Children ───────────────────────────────────────────────────────
  openChildrenModal(parent: UserResponseDto): void {
    this.managedParent = parent;
    this.children = [];
    this.childSearch = '';
    this.childResults = [];
    this.showChildrenModal = true;
    this.loadChildren(parent.id);
  }

  closeChildrenModal(): void {
    this.showChildrenModal = false;
    this.managedParent = null;
    this.loadParents(this.pageIndex);
  }

  loadChildren(parentId: string): void {
    this.childrenLoading = true;
    this.parentService.getChildren(parentId).subscribe({
      next: (list) => { this.children = list; this.childrenLoading = false; },
      error: () => { this.childrenLoading = false; }
    });
  }

  searchChildren(): void {
    if (!this.childSearch.trim()) return;
    this.childSearching = true;
    this.userService.listUsers(0, 10, { email: this.childSearch.trim() }).subscribe({
      next: (p) => {
        const linked = new Set(this.children.map(c => c.id));
        this.childResults = p.content.filter(u => !linked.has(u.id) && u.role !== 'PARENT');
        this.childSearching = false;
      },
      error: () => { this.childSearching = false; }
    });
  }

  assignChild(childId: string): void {
    if (!this.managedParent) return;
    this.parentService.assignChild(this.managedParent.id, childId).subscribe({
      next: () => {
        this.childResults = [];
        this.childSearch = '';
        this.loadChildren(this.managedParent!.id);
      },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to link child'; }
    });
  }

  removeChild(childId: string): void {
    if (!this.managedParent) return;
    this.parentService.removeChild(this.managedParent.id, childId).subscribe({
      next: () => this.loadChildren(this.managedParent!.id),
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to unlink child'; }
    });
  }

  hasError(form: FormGroup, controlName: string, error: string): boolean {
    const control = form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}
