import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { ResourcesService, LearningResource } from '../../services/resource.service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor-dashboard.html'
})
export class TutorDashboard implements OnInit {

  // ── Profile ──────────────────────────────────────────────────────────────
  tutorName  = '';
  tutorEmail = '';

  // ── Level 1: Courses ─────────────────────────────────────────────────────
  courses: any[]  = [];
  selectedCourse: any = null;

  // ── Level 2: Assessments ─────────────────────────────────────────────────
  classes: { id: number; name: string }[] = [];
  assessments: Assessment[] = [];
  loadingAssessments = false;

  showAssessmentForm = false;
  editingAssessment  = false;
  savingAssessment   = false;
  assessmentFormError = '';
  assessmentForm: Assessment = this.emptyAssessment();

  // ── Level 3: Resources (per assessment) ──────────────────────────────────
  expandedAssessmentId: number | null = null;
  resourcesMap: Record<number, LearningResource[]> = {};
  loadingResourcesFor: number | null = null;

  uploadingFor: number | null = null;
  uploadTitle    = '';
  uploadType     = 'PDF';
  uploadFile: File | null = null;
  uploadFileName = '';
  uploadError    = '';
  showUploadFor: number | null = null;

  readonly fileTypes = ['PDF', 'AUDIO', 'DOCX', 'IMAGE', 'VIDEO', 'LINK'];
  readonly types     = ['EXAM', 'QUIZ', 'PROJECT'];
  readonly statuses  = ['DRAFT', 'PUBLISHED', 'CLOSED'];

  successMsg = '';
  private api = environment.apiUrl;

  constructor(
    private assessmentSvc: AssessmentService,
    private resourceSvc: ResourcesService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any>(`${this.api}/api/users/me`).pipe(
      catchError(() => of(null)),
      switchMap(profile => {
        if (profile) {
          this.tutorName  = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;
          this.tutorEmail = profile.email;
        }
        return forkJoin({
          courses: this.tutorEmail
            ? this.http.get<any>(`${this.api}/api/v1/courses/by-tutor?email=${encodeURIComponent(this.tutorEmail)}`).pipe(catchError(() => of([])))
            : of([]),
          classes: this.http.get<any[]>(`${this.api}/api/classes`).pipe(catchError(() => of([])))
        });
      })
    ).subscribe(({ courses, classes }: any) => {
      this.courses = Array.isArray(courses) ? courses : (courses?.content ?? []);
      this.classes = classes || [];
      this.cdr.detectChanges();
    });
  }

  // ── Course selection ─────────────────────────────────────────────────────

  selectCourse(course: any): void {
    this.selectedCourse       = course;
    this.showAssessmentForm   = false;
    this.expandedAssessmentId = null;
    this.showUploadFor        = null;
    this.loadAssessments();
  }

  // ── Assessments ──────────────────────────────────────────────────────────

  loadAssessments(): void {
    if (!this.selectedCourse) return;
    this.loadingAssessments = true;
    this.cdr.detectChanges();

    this.assessmentSvc.getAll().pipe(catchError(() => of([]))).subscribe(data => {
      const name = (this.selectedCourse.name || '').toLowerCase();
      this.assessments = (data || []).filter((a: Assessment) =>
        (a.courseName || '').toLowerCase() === name
      );
      this.loadingAssessments = false;
      this.cdr.detectChanges();
    });
  }

  openCreateAssessment(): void {
    this.assessmentForm      = this.emptyAssessment();
    this.assessmentForm.courseName = this.selectedCourse?.name || '';
    this.editingAssessment   = false;
    this.assessmentFormError = '';
    this.showAssessmentForm  = true;
    this.cdr.detectChanges();
  }

  openEditAssessment(a: Assessment): void {
    this.assessmentForm      = { ...a };
    this.editingAssessment   = true;
    this.assessmentFormError = '';
    this.showAssessmentForm  = true;
    this.cdr.detectChanges();
  }

  cancelAssessmentForm(): void {
    this.showAssessmentForm  = false;
    this.assessmentFormError = '';
    this.cdr.detectChanges();
  }

  saveAssessment(): void {
    if (!this.assessmentForm.title?.trim() || !this.assessmentForm.type || !this.assessmentForm.status) {
      this.assessmentFormError = 'Title, type and status are required.';
      this.cdr.detectChanges();
      return;
    }
    this.savingAssessment    = true;
    this.assessmentFormError = '';
    this.cdr.detectChanges();

    const payload: Assessment = {
      ...this.assessmentForm,
      courseName: this.selectedCourse?.name || this.assessmentForm.courseName
    };

    const op$ = this.editingAssessment && payload.id
      ? this.assessmentSvc.update(payload.id, payload)
      : this.assessmentSvc.create(payload);

    op$.subscribe({
      next: () => {
        this.savingAssessment   = false;
        this.showAssessmentForm = false;
        this.flash('Assessment saved ✓');
        this.loadAssessments();
      },
      error: () => {
        this.savingAssessment    = false;
        this.assessmentFormError = 'Failed to save. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteAssessment(a: Assessment): void {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.assessmentSvc.delete(a.id!).subscribe({
      next: () => {
        this.assessments = this.assessments.filter(x => x.id !== a.id);
        if (this.expandedAssessmentId === a.id) this.expandedAssessmentId = null;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Resources ────────────────────────────────────────────────────────────

  toggleResources(a: Assessment): void {
    if (this.expandedAssessmentId === a.id) {
      this.expandedAssessmentId = null;
      this.showUploadFor        = null;
      this.cdr.detectChanges();
      return;
    }
    this.expandedAssessmentId = a.id!;
    this.showUploadFor        = null;
    if (!this.resourcesMap[a.id!]) {
      this.loadResources(a.id!);
    }
    this.cdr.detectChanges();
  }

  loadResources(assessmentId: number): void {
    this.loadingResourcesFor = assessmentId;
    this.cdr.detectChanges();
    this.resourceSvc.getByAssessment(assessmentId).pipe(catchError(() => of([]))).subscribe(data => {
      this.resourcesMap[assessmentId] = data || [];
      this.loadingResourcesFor        = null;
      this.cdr.detectChanges();
    });
  }

  openUpload(assessmentId: number): void {
    this.showUploadFor = assessmentId;
    this.uploadTitle   = '';
    this.uploadType    = 'PDF';
    this.uploadFile    = null;
    this.uploadFileName = '';
    this.uploadError   = '';
    this.cdr.detectChanges();
  }

  cancelUpload(): void {
    this.showUploadFor = null;
    this.uploadError   = '';
    this.cdr.detectChanges();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile     = input.files?.[0] ?? null;
    this.uploadFileName = this.uploadFile?.name ?? '';
    this.cdr.detectChanges();
  }

  submitUpload(assessmentId: number): void {
    if (!this.uploadTitle.trim()) { this.uploadError = 'Title is required.'; return; }
    if (!this.uploadFile)         { this.uploadError = 'Please select a file.'; return; }

    this.uploadingFor = assessmentId;
    this.uploadError  = '';
    this.cdr.detectChanges();

    const fd = new FormData();
    fd.append('file',         this.uploadFile);
    fd.append('title',        this.uploadTitle.trim());
    fd.append('type',         this.uploadType);
    fd.append('published',    'true');
    fd.append('assessmentId', String(assessmentId));

    this.resourceSvc.upload(fd).subscribe({
      next: () => {
        this.uploadingFor  = null;
        this.showUploadFor = null;
        this.flash('Resource uploaded ✓');
        this.loadResources(assessmentId);
      },
      error: () => {
        this.uploadingFor = null;
        this.uploadError  = 'Upload failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteResource(r: LearningResource, assessmentId: number): void {
    if (!confirm(`Delete resource "${r.title}"?`)) return;
    this.resourceSvc.delete(r.id!).subscribe({
      next: () => {
        this.resourcesMap[assessmentId] = (this.resourcesMap[assessmentId] || []).filter(x => x.id !== r.id);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  resourceIcon(type: string): string {
    const map: Record<string, string> = { PDF: '📄', AUDIO: '🎵', DOCX: '📝', IMAGE: '🖼️', VIDEO: '🎬', LINK: '🔗' };
    return map[type] ?? '📎';
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  statusColor(s: string): string { return s==='PUBLISHED'?'#15803d':s==='DRAFT'?'#b45309':'#dc2626'; }
  statusBg(s: string):    string { return s==='PUBLISHED'?'#dcfce7':s==='DRAFT'?'#fef3c7':'#fee2e2'; }
  typeColor(t: string):   string { return t==='EXAM'?'#6d28d9':t==='QUIZ'?'#1d4ed8':'#b45309'; }
  typeBg(t: string):      string { return t==='EXAM'?'#ede9fe':t==='QUIZ'?'#dbeafe':'#fef3c7'; }
  levelBg(l: string):     string {
    const m: Record<string,string>={A1:'#dcfce7',A2:'#bbf7d0',B1:'#dbeafe',B2:'#bfdbfe',C1:'#ede9fe',C2:'#ddd6fe'};
    return m[l]??'#f1f5f9';
  }
  levelColor(l: string):  string {
    const m: Record<string,string>={A1:'#15803d',A2:'#166534',B1:'#1d4ed8',B2:'#1e40af',C1:'#6d28d9',C2:'#5b21b6'};
    return m[l]??'#374151';
  }

  private flash(msg: string): void {
    this.successMsg = msg;
    this.cdr.detectChanges();
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
  }

  private emptyAssessment(): Assessment {
    return { title: '', courseName: '', type: 'EXAM', status: 'DRAFT', className: '' };
  }
}
