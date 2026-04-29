import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { AssessmentService } from '../../../services/assessment.service';
import { ResourcesService, LearningResource } from '../../../services/resource.service';
import { GradeService, Grade } from '../../../services/grade.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-assessment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-assessment-detail.html'
})
export class StudentAssessmentDetail implements OnInit {

  assessmentId = 0;
  assessment: any = null;
  resources: LearningResource[] = [];
  grade: Grade | null = null;

  loading = true;
  loadingResources = true;
  loadingGrade = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private resourceService: ResourcesService,
    private gradeService: GradeService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.assessmentId) {
      this.error = 'Invalid assessment ID.';
      this.loading = this.loadingResources = this.loadingGrade = false;
      return;
    }

    this.loadAssessment();
    this.loadResources();
    this.loadGrade();
  }

  private loadAssessment(): void {
    this.assessmentService.getById(this.assessmentId).pipe(
      timeout(12000),
      catchError(() => of(null))
    ).subscribe(a => {
      this.assessment = a;
      if (!a) this.error = 'Assessment not found or unavailable.';
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private loadResources(): void {
    this.resourceService.getByAssessment(this.assessmentId).pipe(
      timeout(12000),
      catchError(() => of([]))
    ).subscribe(res => {
      this.resources = (res as LearningResource[]).filter(r => r.published !== false);
      this.loadingResources = false;
      this.cdr.detectChanges();
    });
  }

  private loadGrade(): void {
    const email = this.auth.getEmail();
    if (!email) { this.loadingGrade = false; return; }

    this.gradeService.getByStudent(email).pipe(
      timeout(12000),
      catchError(() => of([]))
    ).subscribe(grades => {
      this.grade = (grades as Grade[]).find(g => g.assessmentId === this.assessmentId) ?? null;
      this.loadingGrade = false;
      this.cdr.detectChanges();
    });
  }

  openFile(url: string): void { window.open(url, '_blank'); }

  fileIcon(type: string): string {
    const map: Record<string, string> = { PDF: '📄', AUDIO: '🎵', DOCX: '📝', IMAGE: '🖼️', VIDEO: '🎬' };
    return map[type?.toUpperCase()] ?? '📎';
  }

  mentionColor(m: string): string {
    return ({ EXCELLENT: '#15803d', GOOD: '#1d4ed8', AVERAGE: '#b45309', FAIL: '#dc2626' } as any)[m?.toUpperCase()] ?? '#475569';
  }
  mentionBg(m: string): string {
    return ({ EXCELLENT: '#dcfce7', GOOD: '#dbeafe', AVERAGE: '#fef3c7', FAIL: '#fee2e2' } as any)[m?.toUpperCase()] ?? '#f1f5f9';
  }
  statusBg(s: string): string {
    return ({ PUBLISHED: '#dcfce7', DRAFT: '#fef3c7', CLOSED: '#fee2e2' } as any)[s] ?? '#f1f5f9';
  }
  statusColor(s: string): string {
    return ({ PUBLISHED: '#15803d', DRAFT: '#b45309', CLOSED: '#dc2626' } as any)[s] ?? '#374151';
  }
  typeBg(t: string): string {
    return ({ EXAM: '#ede9fe', QUIZ: '#dbeafe', PROJECT: '#fef3c7' } as any)[t] ?? '#f1f5f9';
  }
  typeColor(t: string): string {
    return ({ EXAM: '#6d28d9', QUIZ: '#1d4ed8', PROJECT: '#b45309' } as any)[t] ?? '#374151';
  }
}
