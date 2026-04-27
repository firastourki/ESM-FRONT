import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { CourseService } from '../../services/course.service';
import { catchError } from 'rxjs/operators';
import { of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-tutor-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tutor-assessments.html',
  styleUrls: ['./tutor-assessments.css']
})
export class TutorAssessments implements OnInit {

  assessments: Assessment[] = [];
  assessmentTypes: string[] = [];
  assessmentStatuses: string[] = [];
  courses: any[] = [];

  myClasses: { id: number; name: string; level: string; specialty: string }[] = [];
  tutorId = '';

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

  hours: string[]   = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  totalCount = 0; publishedCount = 0; draftCount = 0; closedCount = 0;

  searchQuery = ''; filterStatus = 'ALL'; filterType = 'ALL';
  currentPage = 1; pageSize = PAGE_SIZE;

  notification: { message: string; type: 'success' | 'error' | 'confirm' } | null = null;
  confirmCallback: (() => void) | null = null;
  loading = false;

  constructor(
    private assessmentService: AssessmentService,
    private courseService: CourseService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/api/users/me`).pipe(
      catchError(() => of(null)),
      switchMap(profile => {
        this.tutorId = profile?.id ?? profile?.uuid ?? '';
        return this.http.get<any[]>(`${environment.apiUrl}/api/classes`).pipe(catchError(() => of([])));
      })
    ).subscribe((classes: any[]) => {
      this.myClasses = (classes || [])
        .filter(c => c.tutorId === this.tutorId)
        .map(c => ({ id: c.id, name: c.name, level: c.level ?? '', specialty: c.specialty ?? '' }));
      this.refresh();
    });
    this.loadAssessments();
    this.loadEnums();
    this.loadCourses();
  }

  private refresh(): void { this.cdr.detectChanges(); }

  loadCourses(): void {
    this.courseService.getAll().pipe(catchError(() => of([]))).subscribe(data => { this.courses = data; this.refresh(); });
  }

  toggleStartTimePicker(): void { this.showStartTimePicker = !this.showStartTimePicker; this.showEndTimePicker = false; this.refresh(); }
  toggleEndTimePicker(): void   { this.showEndTimePicker = !this.showEndTimePicker; this.showStartTimePicker = false; this.refresh(); }
  selectStartHour(h: string): void   { this.startHour = h;   this.refresh(); }
  selectStartMinute(m: string): void { this.startMinute = m; this.refresh(); }
  selectEndHour(h: string): void     { this.endHour = h;     this.refresh(); }
  selectEndMinute(m: string): void   { this.endMinute = m;   this.refresh(); }
  confirmStartTime(): void { this.showStartTimePicker = false; this.refresh(); }
  confirmEndTime(): void   { this.showEndTimePicker = false;   this.refresh(); }

  get startTimeLabel(): string { return `${this.startHour}:${this.startMinute}`; }
  get endTimeLabel(): string   { return `${this.endHour}:${this.endMinute}`; }

  private buildDateTime(d: string, h: string, m: string): string | undefined {
    return d ? `${d}T${h}:${m}:00` : undefined;
  }

  loadAssessments(): void {
    this.loading = true;
    this.assessmentService.getAll().subscribe({
      next: data => { this.assessments = [...data]; this.updateStats(); this.loading = false; this.refresh(); },
      error: () => { this.loading = false; this.showNotif('Unable to load assessments.', 'error'); this.refresh(); }
    });
  }

  loadEnums(): void {
    this.assessmentService.getTypes().subscribe({
      next: d => { this.assessmentTypes = d; this.refresh(); },
      error: () => { this.assessmentTypes = ['EXAM', 'QUIZ', 'PROJECT']; }
    });
    this.assessmentService.getStatuses().subscribe({
      next: d => { this.assessmentStatuses = d; this.refresh(); },
      error: () => { this.assessmentStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED']; }
    });
  }

  updateStats(): void {
    this.totalCount     = this.assessments.length;
    this.publishedCount = this.assessments.filter(a => a.status === 'PUBLISHED').length;
    this.draftCount     = this.assessments.filter(a => a.status === 'DRAFT').length;
    this.closedCount    = this.assessments.filter(a => a.status === 'CLOSED').length;
  }

  get filteredAssessments(): Assessment[] {
    return this.assessments.filter(a => {
      const q = this.searchQuery.toLowerCase();
      return (!q || a.title.toLowerCase().includes(q) || a.courseName.toLowerCase().includes(q))
        && (this.filterStatus === 'ALL' || a.status === this.filterStatus)
        && (this.filterType === 'ALL'   || a.type   === this.filterType);
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredAssessments.length / this.pageSize)); }
  get pagedAssessments(): Assessment[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredAssessments.slice(s, s + this.pageSize);
  }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get paginationFrom(): number { return this.filteredAssessments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get paginationTo(): number   { return Math.min(this.currentPage * this.pageSize, this.filteredAssessments.length); }

  goToPage(p: number): void  { if (p >= 1 && p <= this.totalPages) { this.currentPage = p; this.refresh(); } }
  onFilterChange(): void     { this.currentPage = 1; this.refresh(); }

  openCreateForm(): void {
    this.selectedAssessment = {
      title: '', courseName: '',
      type: this.assessmentTypes[0] || 'EXAM',
      status: this.assessmentStatuses[0] || 'DRAFT',
      className: this.myClasses.length === 1 ? this.myClasses[0].name : ''
    };
    this.startDatePart = ''; this.startHour = '08'; this.startMinute = '00';
    this.endDatePart = '';   this.endHour = '09';   this.endMinute = '00';
    this.editMode = false; this.formError = ''; this.showForm = true; this.refresh();
  }

  editAssessment(a: Assessment): void {
    this.selectedAssessment = { ...a };
    if (a.startDate) { const d = new Date(a.startDate); this.startDatePart = d.toISOString().split('T')[0]; this.startHour = d.getHours().toString().padStart(2,'0'); this.startMinute = d.getMinutes().toString().padStart(2,'0'); }
    else { this.startDatePart = ''; this.startHour = '08'; this.startMinute = '00'; }
    if (a.endDate)   { const d = new Date(a.endDate);   this.endDatePart   = d.toISOString().split('T')[0]; this.endHour   = d.getHours().toString().padStart(2,'0'); this.endMinute   = d.getMinutes().toString().padStart(2,'0'); }
    else { this.endDatePart = ''; this.endHour = '09'; this.endMinute = '00'; }
    this.editMode = true; this.formError = ''; this.showForm = true; this.refresh();
  }

  cancel(): void { this.showForm = false; this.formError = ''; this.refresh(); }

  saveAssessment(): void {
    if (!this.selectedAssessment.title?.trim() || !this.selectedAssessment.courseName?.trim() || !this.selectedAssessment.type || !this.selectedAssessment.status) {
      this.formError = 'All fields are required.'; this.refresh(); return;
    }
    this.formError = '';
    const payload: Assessment = {
      title: this.selectedAssessment.title.trim(), courseName: this.selectedAssessment.courseName.trim(),
      type: this.selectedAssessment.type, status: this.selectedAssessment.status,
      className: this.selectedAssessment.className || undefined,
      startDate: this.buildDateTime(this.startDatePart, this.startHour, this.startMinute),
      endDate:   this.buildDateTime(this.endDatePart,   this.endHour,   this.endMinute),
      duration: this.selectedAssessment.duration || undefined
    };
    if (this.editMode && this.selectedAssessment.id) {
      this.assessmentService.update(this.selectedAssessment.id, payload).subscribe({
        next: u => { const i = this.assessments.findIndex(a => a.id === u.id); if (i !== -1) this.assessments[i] = u; this.assessments = [...this.assessments]; this.updateStats(); this.showForm = false; this.showNotif('Assessment updated ✓', 'success'); this.refresh(); },
        error: () => { this.showNotif('Error updating assessment.', 'error'); this.refresh(); }
      });
    } else {
      this.assessmentService.create(payload).subscribe({
        next: c => { this.assessments = [...this.assessments, c]; this.updateStats(); this.showForm = false; this.showNotif('Assessment created ✓', 'success'); this.refresh(); },
        error: () => { this.showNotif('Error creating assessment.', 'error'); this.refresh(); }
      });
    }
  }

  deleteAssessment(id: number): void {
    this.showNotif('Delete this assessment?', 'confirm', () => {
      this.assessmentService.delete(id).subscribe({
        next: () => { this.assessments = this.assessments.filter(a => a.id !== id); this.updateStats(); this.showNotif('Deleted ✓', 'success'); this.refresh(); },
        error: () => { this.showNotif('Error deleting assessment.', 'error'); this.refresh(); }
      });
    });
  }

  showNotif(message: string, type: 'success' | 'error' | 'confirm', callback?: () => void): void {
    this.notification = { message, type }; this.confirmCallback = callback || null; this.refresh();
    if (type === 'success') setTimeout(() => { this.notification = null; this.refresh(); }, 2500);
  }
  closeNotification(): void { this.notification = null; this.refresh(); }
  confirmAction(): void { if (this.confirmCallback) this.confirmCallback(); this.notification = null; this.refresh(); }

  statusClass(s: string): string { return ({ PUBLISHED:'badge-published', DRAFT:'badge-draft', CLOSED:'badge-closed' } as any)[s] || 'badge-default'; }
  typeClass(t: string):   string { return ({ EXAM:'badge-exam', QUIZ:'badge-quiz', PROJECT:'badge-project' } as any)[t] || 'badge-default'; }
  trackById(_: number, a: Assessment): number { return a.id!; }
}
