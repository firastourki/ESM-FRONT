import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ClassService, ClassResponse } from '../../core/services/class.service';
import { UserService, UserResponseDto } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-classes.html'
})
export class AdminClasses implements OnInit {
  private classService = inject(ClassService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  classes: ClassResponse[] = [];
  loading = false;
  errorMessage = '';

  // ── Create ──────────────────────────────────────────────────────────────
  showCreateModal = false;
  createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    level: [''],
    specialty: [''],
    description: ['']
  });

  // ── Edit ─────────────────────────────────────────────────────────────────
  showEditModal = false;
  editingId: number | null = null;
  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    level: [''],
    specialty: [''],
    description: ['']
  });

  // ── Manage (students + tutor) ─────────────────────────────────────────────
  showManageModal = false;
  managedClass: ClassResponse | null = null;
  manageLoading = false;

  tutorSearch = '';
  tutorResults: UserResponseDto[] = [];
  tutorSearching = false;

  studentSearch = '';
  studentResults: UserResponseDto[] = [];
  studentSearching = false;

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    this.errorMessage = '';
    this.classService.listClasses().subscribe({
      next: (data) => { this.classes = data; this.loading = false; },
      error: (err) => { this.errorMessage = `Failed to load classes: ${err?.message || 'Unknown error'}`; this.loading = false; }
    });
  }

  // ── Create ────────────────────────────────────────────────────────────────
  openCreateModal(): void {
    this.createForm.reset({ name: '', level: '', specialty: '', description: '' });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
    this.showCreateModal = true;
  }

  closeCreateModal(): void { this.showCreateModal = false; }

  submitCreate(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    const v = this.createForm.value;
    this.classService.createClass({
      name: v.name,
      level: v.level || null,
      specialty: v.specialty || null,
      description: v.description || null
    }).subscribe({
      next: () => { this.showCreateModal = false; this.loadClasses(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to create class'; }
    });
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  openEditModal(cls: ClassResponse): void {
    this.editingId = cls.id;
    this.editForm.reset({
      name: cls.name,
      level: cls.level || '',
      specialty: cls.specialty || '',
      description: cls.description || ''
    });
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.showEditModal = true;
  }

  closeEditModal(): void { this.showEditModal = false; this.editingId = null; }

  submitEdit(): void {
    if (this.editForm.invalid || this.editingId === null) { this.editForm.markAllAsTouched(); return; }
    const v = this.editForm.value;
    this.classService.updateClass(this.editingId, {
      name: v.name,
      level: v.level || null,
      specialty: v.specialty || null,
      description: v.description || null
    }).subscribe({
      next: () => { this.showEditModal = false; this.editingId = null; this.loadClasses(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update class'; }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  deleteClass(cls: ClassResponse): void {
    if (!confirm(`Delete class "${cls.name}"? This cannot be undone.`)) return;
    this.classService.deleteClass(cls.id).subscribe({
      next: () => this.loadClasses(),
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to delete class'; }
    });
  }

  // ── Manage Modal ──────────────────────────────────────────────────────────
  openManageModal(cls: ClassResponse): void {
    this.managedClass = { ...cls, students: [...cls.students] };
    this.tutorSearch = '';
    this.tutorResults = [];
    this.studentSearch = '';
    this.studentResults = [];
    this.showManageModal = true;
  }

  closeManageModal(): void {
    this.showManageModal = false;
    this.managedClass = null;
    this.loadClasses();
  }

  private refreshManagedClass(): void {
    if (!this.managedClass) return;
    this.manageLoading = true;
    this.classService.getClass(this.managedClass.id).subscribe({
      next: (c) => { this.managedClass = c; this.manageLoading = false; },
      error: () => { this.manageLoading = false; }
    });
  }

  // ── Tutor ─────────────────────────────────────────────────────────────────
  searchTutors(): void {
    if (!this.tutorSearch.trim()) return;
    this.tutorSearching = true;
    this.userService.listUsers(0, 10, { email: this.tutorSearch.trim() }).subscribe({
      next: (p) => { this.tutorResults = p.content; this.tutorSearching = false; },
      error: () => { this.tutorSearching = false; }
    });
  }

  assignTutor(userId: string): void {
    if (!this.managedClass) return;
    this.classService.assignTutor(this.managedClass.id, userId).subscribe({
      next: (c) => { this.managedClass = c; this.tutorResults = []; this.tutorSearch = ''; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to assign tutor'; }
    });
  }

  removeTutor(): void {
    if (!this.managedClass) return;
    if (!confirm('Remove the current tutor from this class?')) return;
    this.classService.removeTutor(this.managedClass.id).subscribe({
      next: (c) => { this.managedClass = c; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to remove tutor'; }
    });
  }

  // ── Students ──────────────────────────────────────────────────────────────
  searchStudents(): void {
    if (!this.studentSearch.trim()) return;
    this.studentSearching = true;
    this.userService.listUsers(0, 10, { email: this.studentSearch.trim() }).subscribe({
      next: (p) => {
        const existing = new Set((this.managedClass?.students || []).map(s => s.id));
        this.studentResults = p.content.filter(u => !existing.has(u.id));
        this.studentSearching = false;
      },
      error: () => { this.studentSearching = false; }
    });
  }

  assignStudent(userId: string): void {
    if (!this.managedClass) return;
    this.classService.assignStudent(this.managedClass.id, userId).subscribe({
      next: (c) => { this.managedClass = c; this.studentResults = []; this.studentSearch = ''; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to assign student'; }
    });
  }

  removeStudent(userId: string): void {
    if (!this.managedClass) return;
    this.classService.removeStudent(this.managedClass.id, userId).subscribe({
      next: (c) => { this.managedClass = c; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to remove student'; }
    });
  }

  hasError(form: FormGroup, controlName: string, error: string): boolean {
    const control = form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}
