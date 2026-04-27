import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  classes: ClassResponse[] = [];
  loading = true;
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

  // ── Manage ────────────────────────────────────────────────────────────────
  showManageModal = false;
  managedClass: ClassResponse | null = null;

  // Tutors — radio-select one, then assign
  allTutors: UserResponseDto[] = [];
  tutorsLoading = false;
  tutorQuery = '';
  selectedTutorId: string | null = null;

  // Students — per-row Add button
  allStudents: UserResponseDto[] = [];
  studentsLoading = false;
  studentQuery = '';

  get filteredTutors(): UserResponseDto[] {
    const q = this.tutorQuery.toLowerCase().trim();
    return this.allTutors.filter(u => {
      if (u.role !== 'TUTOR') return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.firstName ?? '').toLowerCase().includes(q) ||
        (u.lastName ?? '').toLowerCase().includes(q)
      );
    });
  }

  get filteredStudents(): UserResponseDto[] {
    const enrolled = new Set((this.managedClass?.students || []).map(s => s.id));
    const q = this.studentQuery.toLowerCase().trim();
    return this.allStudents.filter(u => {
      if (u.role !== 'STUDENT') return false;
      if (enrolled.has(u.id)) return false;
      // exclude students already enrolled in a different class
      if (u.className) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.firstName ?? '').toLowerCase().includes(q) ||
        (u.lastName ?? '').toLowerCase().includes(q)
      );
    });
  }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    this.errorMessage = '';
    this.classService.listClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = `Failed to load classes: ${err?.error?.message || err?.message || 'Unknown error'}`;
        this.loading = false;
        this.cdr.markForCheck();
      }
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
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to create class'; this.cdr.markForCheck(); }
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
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update class'; this.cdr.markForCheck(); }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  deleteClass(cls: ClassResponse): void {
    if (!confirm(`Delete class "${cls.name}"? This cannot be undone.`)) return;
    this.classService.deleteClass(cls.id).subscribe({
      next: () => this.loadClasses(),
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to delete class'; this.cdr.markForCheck(); }
    });
  }

  // ── Manage Modal ──────────────────────────────────────────────────────────
  openManageModal(cls: ClassResponse): void {
    this.managedClass = { ...cls, students: [...cls.students] };
    this.tutorQuery = '';
    this.studentQuery = '';
    this.selectedTutorId = null;
    this.allTutors = [];
    this.allStudents = [];
    this.showManageModal = true;
    this.loadAllTutors();
    this.loadAllStudents();
  }

  closeManageModal(): void {
    this.showManageModal = false;
    this.managedClass = null;
    this.loadClasses();
  }

  private loadAllTutors(): void {
    this.tutorsLoading = true;
    this.userService.listUsers(0, 200, { role: 'TUTOR' }).subscribe({
      next: (p) => { this.allTutors = p.content; this.tutorsLoading = false; this.cdr.markForCheck(); },
      error: () => { this.tutorsLoading = false; this.cdr.markForCheck(); }
    });
  }

  private loadAllStudents(): void {
    this.studentsLoading = true;
    this.userService.listUsers(0, 500, { role: 'STUDENT' }).subscribe({
      next: (p) => { this.allStudents = p.content; this.studentsLoading = false; this.cdr.markForCheck(); },
      error: () => { this.studentsLoading = false; this.cdr.markForCheck(); }
    });
  }

  // ── Tutor ─────────────────────────────────────────────────────────────────
  assignSelectedTutor(): void {
    if (!this.managedClass || !this.selectedTutorId) return;
    this.classService.assignTutor(this.managedClass.id, this.selectedTutorId).subscribe({
      next: (c) => { this.managedClass = c; this.selectedTutorId = null; this.tutorQuery = ''; this.cdr.markForCheck(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to assign tutor'; this.cdr.markForCheck(); }
    });
  }

  removeTutor(): void {
    if (!this.managedClass) return;
    if (!confirm('Remove the current tutor from this class?')) return;
    this.classService.removeTutor(this.managedClass.id).subscribe({
      next: (c) => { this.managedClass = c; this.cdr.markForCheck(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to remove tutor'; this.cdr.markForCheck(); }
    });
  }

  // ── Students ──────────────────────────────────────────────────────────────
  assignStudent(userId: string): void {
    if (!this.managedClass) return;
    this.classService.assignStudent(this.managedClass.id, userId).subscribe({
      next: (c) => { this.managedClass = c; this.cdr.markForCheck(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to assign student'; this.cdr.markForCheck(); }
    });
  }

  removeStudent(userId: string): void {
    if (!this.managedClass) return;
    this.classService.removeStudent(this.managedClass.id, userId).subscribe({
      next: (c) => { this.managedClass = c; this.cdr.markForCheck(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to remove student'; this.cdr.markForCheck(); }
    });
  }

  hasError(form: FormGroup, controlName: string, error: string): boolean {
    const control = form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}
