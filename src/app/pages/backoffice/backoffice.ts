import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { CourseService } from '../../services/course.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './backoffice.html',
  styleUrls: ['./backoffice.css']
})
export class Backoffice implements OnInit {

  assessments: Assessment[] = [];
  assessmentTypes: string[] = [];
  assessmentStatuses: string[] = [];
  courses: any[] = [];

  // 🆕 Liste des classes disponibles depuis auth-service
  availableClasses: { id: number; name: string; level: string; specialty: string }[] = [];

  selectedAssessment: Assessment = { title: '', courseName: '', type: '', status: '' };
  showForm = false;
  editMode = false;
  formError = '';

  startDatePart = '';
  startHour = '08';
  startMinute = '00';

  endDatePart = '';
  endHour = '09';
  endMinute = '00';

  showStartTimePicker = false;
  showEndTimePicker = false;

  hours: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  totalCount = 0;
  publishedCount = 0;
  draftCount = 0;
  closedCount = 0;

  searchQuery = '';
  filterStatus = 'ALL';
  filterType = 'ALL';

  currentPage = 1;
  pageSize = PAGE_SIZE;

  notification: { message: string; type: 'success' | 'error' | 'confirm' } | null = null;
  confirmCallback: (() => void) | null = null;

  loading = false;

  constructor(
    private assessmentService: AssessmentService,
    private courseService: CourseService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAssessments();
    this.loadEnums();
    this.loadCourses();
    this.loadClasses(); // 🆕
  }

  private refresh(): void {
    this.cdr.detectChanges();
  }

  loadCourses(): void {
    this.courseService.getAll().pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.courses = data;
      this.refresh();
    });
  }

  // 🆕 Charge les classes depuis auth-service via gateway
  loadClasses(): void {
    this.http.get<any[]>(`${environment.apiUrl}/api/classes`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.availableClasses = data;
      this.refresh();
    });
  }

  toggleStartTimePicker(): void {
    this.showStartTimePicker = !this.showStartTimePicker;
    this.showEndTimePicker = false;
    this.refresh();
  }

  toggleEndTimePicker(): void {
    this.showEndTimePicker = !this.showEndTimePicker;
    this.showStartTimePicker = false;
    this.refresh();
  }

  selectStartHour(h: string): void { this.startHour = h; this.refresh(); }
  selectStartMinute(m: string): void { this.startMinute = m; this.refresh(); }
  selectEndHour(h: string): void { this.endHour = h; this.refresh(); }
  selectEndMinute(m: string): void { this.endMinute = m; this.refresh(); }

  confirmStartTime(): void { this.showStartTimePicker = false; this.refresh(); }
  confirmEndTime(): void { this.showEndTimePicker = false; this.refresh(); }

  get startTimeLabel(): string { return `${this.startHour}:${this.startMinute}`; }
  get endTimeLabel(): string { return `${this.endHour}:${this.endMinute}`; }

  private buildDateTime(datePart: string, hour: string, minute: string): string | undefined {
    if (!datePart) return undefined;
    return `${datePart}T${hour}:${minute}:00`;
  }

  loadAssessments(): void {
    this.loading = true;
    this.assessmentService.getAll().subscribe({
      next: data => {
        this.assessments = [...data];
        this.updateStats();
        this.loading = false;
        this.refresh();
      },
      error: () => {
        this.loading = false;
        this.showNotif('Unable to load assessments. Make sure backend :8080 is running.', 'error');
        this.refresh();
      }
    });
  }

  loadEnums(): void {
    this.assessmentService.getTypes().subscribe({
      next: data => { this.assessmentTypes = data; this.refresh(); },
      error: () => { this.assessmentTypes = ['EXAM', 'QUIZ', 'PROJECT']; }
    });
    this.assessmentService.getStatuses().subscribe({
      next: data => { this.assessmentStatuses = data; this.refresh(); },
      error: () => { this.assessmentStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED']; }
    });
  }

  updateStats(): void {
    this.totalCount = this.assessments.length;
    this.publishedCount = this.assessments.filter(a => a.status === 'PUBLISHED').length;
    this.draftCount = this.assessments.filter(a => a.status === 'DRAFT').length;
    this.closedCount = this.assessments.filter(a => a.status === 'CLOSED').length;
  }

  get filteredAssessments(): Assessment[] {
    return this.assessments.filter(a => {
      const matchSearch = !this.searchQuery ||
        a.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.courseName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = this.filterStatus === 'ALL' || a.status === this.filterStatus;
      const matchType = this.filterType === 'ALL' || a.type === this.filterType;
      return matchSearch && matchStatus && matchType;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredAssessments.length / this.pageSize)); }
  get pagedAssessments(): Assessment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAssessments.slice(start, start + this.pageSize);
  }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get paginationFrom(): number { return this.filteredAssessments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get paginationTo(): number { return Math.min(this.currentPage * this.pageSize, this.filteredAssessments.length); }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) { this.currentPage = p; this.refresh(); }
  }

  onFilterChange(): void { this.currentPage = 1; this.refresh(); }

  openCreateForm(): void {
    this.selectedAssessment = {
      title: '', courseName: '',
      type: this.assessmentTypes[0] || 'EXAM',
      status: this.assessmentStatuses[0] || 'DRAFT',
      className: ''  // 🆕
    };
    this.startDatePart = ''; this.startHour = '08'; this.startMinute = '00';
    this.endDatePart = ''; this.endHour = '09'; this.endMinute = '00';
    this.editMode = false;
    this.formError = '';
    this.showForm = true;
    this.refresh();
  }

  editAssessment(a: Assessment): void {
    this.selectedAssessment = { ...a };
    if (a.startDate) {
      const d = new Date(a.startDate);
      this.startDatePart = d.toISOString().split('T')[0];
      this.startHour = d.getHours().toString().padStart(2, '0');
      this.startMinute = d.getMinutes().toString().padStart(2, '0');
    } else {
      this.startDatePart = ''; this.startHour = '08'; this.startMinute = '00';
    }
    if (a.endDate) {
      const d = new Date(a.endDate);
      this.endDatePart = d.toISOString().split('T')[0];
      this.endHour = d.getHours().toString().padStart(2, '0');
      this.endMinute = d.getMinutes().toString().padStart(2, '0');
    } else {
      this.endDatePart = ''; this.endHour = '09'; this.endMinute = '00';
    }
    this.editMode = true;
    this.formError = '';
    this.showForm = true;
    this.refresh();
  }

  cancel(): void { this.showForm = false; this.formError = ''; this.refresh(); }

  saveAssessment(): void {
    if (!this.selectedAssessment.title?.trim() ||
      !this.selectedAssessment.courseName?.trim() ||
      !this.selectedAssessment.type ||
      !this.selectedAssessment.status) {
      this.formError = 'All fields are required.';
      this.refresh();
      return;
    }
    this.formError = '';

    const payload: Assessment = {
      title: this.selectedAssessment.title.trim(),
      courseName: this.selectedAssessment.courseName.trim(),
      type: this.selectedAssessment.type,
      status: this.selectedAssessment.status,
      className: this.selectedAssessment.className || undefined, // 🆕
      startDate: this.buildDateTime(this.startDatePart, this.startHour, this.startMinute),
      endDate: this.buildDateTime(this.endDatePart, this.endHour, this.endMinute),
      duration: this.selectedAssessment.duration || undefined
    };

    if (this.editMode && this.selectedAssessment.id) {
      this.assessmentService.update(this.selectedAssessment.id, payload).subscribe({
        next: updated => {
          const idx = this.assessments.findIndex(a => a.id === updated.id);
          if (idx !== -1) this.assessments[idx] = updated;
          this.assessments = [...this.assessments];
          this.updateStats();
          this.showForm = false;
          this.showNotif('Assessment updated successfully ✓', 'success');
          this.refresh();
        },
        error: () => { this.showNotif('Error updating assessment.', 'error'); this.refresh(); }
      });
    } else {
      this.assessmentService.create(payload).subscribe({
        next: created => {
          this.assessments = [...this.assessments, created];
          this.updateStats();
          this.showForm = false;
          this.showNotif('Assessment created successfully ✓', 'success');
          this.refresh();
        },
        error: () => { this.showNotif('Error creating assessment.', 'error'); this.refresh(); }
      });
    }
  }

  deleteAssessment(id: number): void {
    this.showNotif('Delete this assessment?', 'confirm', () => {
      this.assessmentService.delete(id).subscribe({
        next: () => {
          this.assessments = this.assessments.filter(a => a.id !== id);
          this.updateStats();
          this.showNotif('Assessment deleted ✓', 'success');
          this.refresh();
        },
        error: () => { this.showNotif('Error deleting assessment.', 'error'); this.refresh(); }
      });
    });
  }

  showNotif(message: string, type: 'success' | 'error' | 'confirm', callback?: () => void): void {
    this.notification = { message, type };
    this.confirmCallback = callback || null;
    this.refresh();
    if (type === 'success') {
      setTimeout(() => { this.notification = null; this.refresh(); }, 2500);
    }
  }

  closeNotification(): void { this.notification = null; this.refresh(); }

  confirmAction(): void {
    if (this.confirmCallback) this.confirmCallback();
    this.notification = null;
    this.refresh();
  }

  statusClass(status: string): string {
    const map: Record<string, string> = { PUBLISHED: 'badge-published', DRAFT: 'badge-draft', CLOSED: 'badge-closed' };
    return map[status] || 'badge-default';
  }

  typeClass(type: string): string {
    const map: Record<string, string> = { EXAM: 'badge-exam', QUIZ: 'badge-quiz', PROJECT: 'badge-project' };
    return map[type] || 'badge-default';
  }

  trackById(_: number, a: Assessment): number { return a.id!; }
}
