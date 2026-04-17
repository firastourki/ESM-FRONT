// src/app/pages/admin/admin-users.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService, UserResponseDto } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.html'
})
export class AdminUsers implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef); // Add this

  users: UserResponseDto[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  errorMessage = '';

  filterForm = this.fb.group({
    email: ['' as string | null],
    firstName: ['' as string | null],
    lastName: ['' as string | null],
    cin: ['' as string | null],
    phoneNumber: ['' as string | null]
  });

  showCreateModal = false;
  createForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    cin: ['', [Validators.pattern(/^\d{8}$/)]],
    role: ['USER', [Validators.required]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(6)]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    status: ['ACTIVE', [Validators.required]]
  });

  showEditModal = false;
  editForm: FormGroup = this.fb.group({
    id: [''],
    email: ['', [Validators.required, Validators.email]],
    cin: ['', [Validators.pattern(/^\d{8}$/)]],
    role: ['', [Validators.required]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(6)]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    status: ['', [Validators.required]]
  });

  ngOnInit(): void {
    console.log('🔵 AdminUsers ngOnInit called');
    this.loadUsers();
  }

  loadUsers(page: number = this.pageIndex): void {
    console.log('🟢 loadUsers called, page:', page, 'loading:', this.loading);
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck(); // Add this

    const raw = this.filterForm.value;
    const filters = {
      email: raw.email ?? undefined,
      firstName: raw.firstName ?? undefined,
      lastName: raw.lastName ?? undefined,
      cin: raw.cin ?? undefined,
      phoneNumber: raw.phoneNumber ?? undefined
    };

    console.log('📤 Calling userService.listUsers with filters:', filters);

    this.userService.listUsers(page, this.pageSize, filters).subscribe({
      next: (pageData) => {
        console.log('✅ Users loaded successfully:', pageData);
        this.users = pageData.content;
        this.totalElements = pageData.totalElements;
        this.pageIndex = pageData.number;
        this.pageSize = pageData.size;
        this.loading = false;
        console.log('🟢 Loading complete. Users count:', this.users.length);
        this.cdr.detectChanges(); // Add this - Force change detection
      },
      error: (err) => {
        console.error('❌ LOAD USERS ERROR', err);
        this.errorMessage = `Failed to load users: ${err?.message || 'Unknown error'}`;
        this.loading = false;
        this.cdr.detectChanges(); // Add this
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadUsers(0);
  }

  clearFilters(): void {
    this.filterForm.reset({
      email: null,
      firstName: null,
      lastName: null,
      cin: null,
      phoneNumber: null
    });
    this.pageIndex = 0;
    this.loadUsers(0);
  }

  get totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(this.totalElements / this.pageSize) : 0;
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.loadUsers(this.pageIndex - 1);
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.loadUsers(this.pageIndex + 1);
    }
  }

  openCreateModal(): void {
    this.createForm.reset({
      email: '',
      password: '',
      cin: '',
      role: 'USER',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      status: 'ACTIVE'
    });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.userService.createUser(this.createForm.value).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to create user';
      }
    });
  }

  openEditModal(user: UserResponseDto): void {
    this.editForm.reset({
      id: user.id,
      email: user.email,
      cin: user.cin,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      status: user.status
    });
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const id = this.editForm.get('id')?.value;
    if (!id) return;

    const payload = {
      email: this.editForm.value.email,
      cin: this.editForm.value.cin,
      role: this.editForm.value.role,
      firstName: this.editForm.value.firstName,
      lastName: this.editForm.value.lastName,
      phoneNumber: this.editForm.value.phoneNumber,
      address: this.editForm.value.address,
      status: this.editForm.value.status
    };

    this.userService.updateUser(id, payload).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update user';
      }
    });
  }

  deleteUser(user: UserResponseDto): void {
    if (!confirm(`Delete user ${user.email}?`)) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to delete user';
      }
    });
  }

  hasError(form: FormGroup, controlName: string, error: string): boolean {
    const control = form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}