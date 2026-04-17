import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { GradeService, Grade, GradeStats } from '../../services/grade.service';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './grades.html',
  styleUrls: ['./grades.css']
})
export class GradesComponent implements OnInit {

  assessments: Assessment[] = [];
  grades: Grade[] = [];
  stats: GradeStats | null = null;

  selectedAssessmentId: number | null = null;

  // Form
  showForm = false;
  editMode = false;
  formError = '';
  selectedGrade: Grade = this.emptyGrade();

  // Search
  searchQuery = '';

  // Loading
  loadingAssessments = false;
  loadingGrades = false;
  generatingCertificate = false;

  // Notification
  notification: { message: string; type: 'success' | 'error' | 'confirm' } | null = null;
  confirmCallback: (() => void) | null = null;

  constructor(
    private assessmentService: AssessmentService,
    private gradeService: GradeService,
    private certificateService: CertificateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAssessments();
  }

  private refresh(): void { this.cdr.detectChanges(); }

  private emptyGrade(): Grade {
    return {
      assessmentId: 0,
      studentName: '',
      studentEmail: '',
      score: 0,
      maxScore: 20,
      comments: ''
    };
  }

  // ── Loaders ────────────────────────────────────────────────────────────────
  loadAssessments(): void {
    this.loadingAssessments = true;
    this.assessmentService.getAll().subscribe({
      next: data => {
        this.assessments = data;
        this.loadingAssessments = false;
        this.refresh();
      },
      error: () => {
        this.loadingAssessments = false;
        this.notify('Unable to load assessments.', 'error');
      }
    });
  }

  loadGrades(): void {
    if (!this.selectedAssessmentId) { this.grades = []; this.stats = null; return; }
    this.loadingGrades = true;
    this.gradeService.getByAssessment(this.selectedAssessmentId).subscribe({
      next: data => {
        this.grades = data;
        this.loadingGrades = false;
        this.refresh();
      },
      error: () => {
        this.grades = [];
        this.loadingGrades = false;
        this.refresh();
      }
    });
    this.gradeService.getStatsByAssessment(this.selectedAssessmentId).subscribe({
      next: data => { this.stats = data; this.refresh(); },
      error: () => { this.stats = null; }
    });
  }

  onAssessmentChange(): void {
    this.grades = [];
    this.stats = null;
    this.showForm = false;
    this.searchQuery = '';
    this.loadGrades();
  }

  get selectedAssessment(): Assessment | undefined {
    return this.assessments.find(a => a.id === this.selectedAssessmentId);
  }

  // ── Filtered ───────────────────────────────────────────────────────────────
  get filteredGrades(): Grade[] {
    return this.grades.filter(g =>
      !this.searchQuery ||
      g.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      g.studentEmail.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // ── Certificate ────────────────────────────────────────────────────────────

  isPassing(g: Grade): boolean {
    if (!g.maxScore || g.maxScore === 0) return false;
    return (g.score / g.maxScore) >= 0.5;
  }

  downloadCertificate(g: Grade): void {
    this.generatingCertificate = true;
    const examTitle = this.selectedAssessment?.title
      ? `${this.selectedAssessment.title}`
      : `Assessment #${g.assessmentId}`;

    this.certificateService.generateCertificate({
      studentName: g.studentName,
      studentEmail: g.studentEmail,
      examTitle: examTitle,
      score: g.score,
      maxScore: g.maxScore,
      passedAt: new Date().toISOString()
    }).subscribe({
      next: (cert) => {
        this.generatingCertificate = false;
        this.certificateService.downloadCertificate(cert.certificateId);
        this.notify(`✅ Certificate generated for ${g.studentName}`, 'success');
        this.refresh();
      },
      error: () => {
        this.generatingCertificate = false;
        this.notify('❌ Failed to generate certificate. Make sure the certificate service is running on port 8097.', 'error');
        this.refresh();
      }
    });
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  openCreateForm(): void {
    this.selectedGrade = this.emptyGrade();
    this.selectedGrade.assessmentId = this.selectedAssessmentId!;
    this.selectedGrade.maxScore = 20;
    this.editMode = false;
    this.formError = '';
    this.showForm = true;
    this.refresh();
  }

  editGrade(g: Grade): void {
    this.selectedGrade = { ...g };
    this.editMode = true;
    this.formError = '';
    this.showForm = true;
    this.refresh();
  }

  cancel(): void {
    this.showForm = false;
    this.formError = '';
    this.refresh();
  }

  saveGrade(): void {
    if (!this.selectedGrade.studentName?.trim()) { this.formError = 'Student name is required.'; return; }
    if (!this.selectedGrade.studentEmail?.trim()) { this.formError = 'Student email is required.'; return; }
    if (this.selectedGrade.score == null) { this.formError = 'Score is required.'; return; }
    if (this.selectedGrade.maxScore == null) { this.formError = 'Max score is required.'; return; }
    if (this.selectedGrade.score > this.selectedGrade.maxScore) { this.formError = 'Score cannot exceed max score.'; return; }

    this.formError = '';
    const payload: Grade = { ...this.selectedGrade, assessmentId: this.selectedAssessmentId! };

    if (this.editMode && this.selectedGrade.id) {
      this.gradeService.update(this.selectedGrade.id, payload).subscribe({
        next: updated => {
          const idx = this.grades.findIndex(g => g.id === updated.id);
          if (idx !== -1) this.grades[idx] = updated;
          this.grades = [...this.grades];
          this.showForm = false;
          this.notify('Grade updated ✓', 'success');
          this.loadGrades();
          this.refresh();
        },
        error: () => this.notify('Error updating grade.', 'error')
      });
    } else {
      this.gradeService.create(payload).subscribe({
        next: created => {
          this.grades = [...this.grades, created];
          this.showForm = false;
          this.notify('Grade added ✓', 'success');
          this.loadGrades();
          this.refresh();
        },
        error: () => this.notify('Error creating grade.', 'error')
      });
    }
  }

  deleteGrade(id: number): void {
    this.notify('Delete this grade?', 'confirm', () => {
      this.gradeService.delete(id).subscribe({
        next: () => {
          this.grades = this.grades.filter(g => g.id !== id);
          this.notify('Grade deleted ✓', 'success');
          this.loadGrades();
          this.refresh();
        },
        error: () => this.notify('Error deleting grade.', 'error')
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getPercentage(g: Grade): number {
    if (!g.maxScore || g.maxScore === 0) return 0;
    return Math.round((g.score / g.maxScore) * 1000) / 10;
  }

  getMention(g: Grade): string {
    const pct = this.getPercentage(g);
    if (pct >= 90) return 'EXCELLENT';
    if (pct >= 75) return 'GOOD';
    if (pct >= 60) return 'AVERAGE';
    return 'FAIL';
  }

  mentionClass(g: Grade): string {
    const m = this.getMention(g);
    const map: Record<string, string> = {
      EXCELLENT: 'mention-excellent',
      GOOD: 'mention-good',
      AVERAGE: 'mention-average',
      FAIL: 'mention-fail'
    };
    return map[m] || '';
  }

  scoreBarWidth(g: Grade): string {
    return `${this.getPercentage(g)}%`;
  }

  scoreBarColor(g: Grade): string {
    const pct = this.getPercentage(g);
    if (pct >= 75) return '#22c55e';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  }

  // ── Notification ───────────────────────────────────────────────────────────
  notify(message: string, type: 'success' | 'error' | 'confirm', callback?: () => void): void {
    this.notification = { message, type };
    this.confirmCallback = callback || null;
    this.refresh();
    if (type === 'success') setTimeout(() => { this.notification = null; this.refresh(); }, 2500);
  }

  closeNotification(): void { this.notification = null; this.refresh(); }

  confirmAction(): void {
    if (this.confirmCallback) this.confirmCallback();
    this.notification = null;
    this.refresh();
  }

  trackById(_: number, g: Grade): number { return g.id!; }
}
