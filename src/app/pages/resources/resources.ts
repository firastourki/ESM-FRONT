import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { ResourcesService, LearningResource } from '../../services/resource.service';
const PAGE_SIZE = 6;

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './resources.html',
  styleUrls: ['./resources.css']
})
export class ResourcesComponent implements OnInit {

  assessments: Assessment[] = [];
  resources: LearningResource[] = [];

  selectedAssessmentId: number | null = null;

  showUploadForm = false;
  uploadTitle = '';
  uploadType = 'PDF';
  uploadPublished = false;
  uploadFile: File | null = null;
  uploadFileName = '';
  uploadError = '';
  uploading = false;

  readonly fileTypes = ['PDF', 'AUDIO', 'DOCX', 'IMAGE'];

  searchQuery = '';
  currentPage = 1;
  pageSize = PAGE_SIZE;

  loadingAssessments = false;
  loadingResources = false;

  notification: { message: string; type: 'success' | 'error' | 'confirm' } | null = null;
  confirmCallback: (() => void) | null = null;

  constructor(
    private assessmentService: AssessmentService,
    private resourceService: ResourcesService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.ngZone.run(() => this.loadAssessments());
  }

  private refresh(): void {
    this.cdr.detectChanges();
  }

  // ── Loaders ────────────────────────────────────────────────────────────────
  loadAssessments(): void {
    this.loadingAssessments = true;
    this.assessmentService.getAll().subscribe({
      next: data => {
        this.assessments = [...data];
        this.loadingAssessments = false;
        this.refresh();
      },
      error: () => {
        this.notify('Unable to load assessments. Make sure the backend is running.', 'error');
        this.loadingAssessments = false;
        this.refresh();
      }
    });
  }

  loadResources(): void {
    if (!this.selectedAssessmentId) { this.resources = []; return; }
    this.loadingResources = true;
    this.resourceService.getByAssessment(this.selectedAssessmentId).subscribe({
      next: data => {
        this.ngZone.run(() => {
          this.resources = [...data];
          this.currentPage = 1;
          this.loadingResources = false;
          this.refresh();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.resources = [];
          this.loadingResources = false;
          this.refresh();
        });
      }
    });
  }

  onAssessmentChange(): void {
    this.resources = [];
    this.searchQuery = '';
    this.showUploadForm = false;
    this.loadResources();
  }

  get selectedAssessment(): Assessment | undefined {
    return this.assessments.find(a => a.id === this.selectedAssessmentId);
  }

  // ── Filtered + paginated ───────────────────────────────────────────────────
  get filteredResources(): LearningResource[] {
    return this.resources.filter(r =>
      !this.searchQuery || r.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredResources.length / this.pageSize));
  }

  get pagedResources(): LearningResource[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredResources.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginationFrom(): number {
    return this.filteredResources.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredResources.length);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) { this.currentPage = p; this.refresh(); }
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  openUploadForm(): void {
    this.uploadTitle = '';
    this.uploadType = 'PDF';
    this.uploadPublished = false;
    this.uploadFile = null;
    this.uploadFileName = '';
    this.uploadError = '';
    this.showUploadForm = true;
    this.refresh();
  }

  cancelUpload(): void {
    this.showUploadForm = false;
    this.uploadError = '';
    this.refresh();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile = input.files[0];
      this.uploadFileName = input.files[0].name;
      const ext = this.uploadFileName.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') this.uploadType = 'PDF';
      else if (['mp3', 'wav', 'ogg'].includes(ext!)) this.uploadType = 'AUDIO';
      else if (['doc', 'docx'].includes(ext!)) this.uploadType = 'DOCX';
      else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext!)) this.uploadType = 'IMAGE';
      this.refresh();
    }
  }

  submitUpload(): void {
    if (!this.uploadTitle.trim()) { this.uploadError = 'Title is required.'; return; }
    if (!this.uploadFile) { this.uploadError = 'Please select a file.'; return; }
    if (!this.selectedAssessmentId) { this.uploadError = 'Select an assessment first.'; return; }

    this.uploadError = '';
    this.uploading = true;
    this.refresh();

    const fd = new FormData();
    fd.append('title', this.uploadTitle.trim());
    fd.append('type', this.uploadType);
    fd.append('published', String(this.uploadPublished));
    fd.append('assessmentId', String(this.selectedAssessmentId));
    fd.append('file', this.uploadFile);

    this.resourceService.upload(fd).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.uploading = false;
          this.showUploadForm = false;
          this.notify('Resource uploaded and linked to assessment ✓', 'success');
          setTimeout(() => this.loadResources(), 300);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.uploading = false;
          this.uploadError = 'Upload failed. Please check your connection or contact your administrator.';
          this.refresh();
        });
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteResource(id: number): void {
    this.notify('Delete this resource?', 'confirm', () => {
      this.resourceService.delete(id).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.resources = this.resources.filter(r => r.id !== id);
            this.notify('Resource deleted ✓', 'success');
            this.refresh();
          });
        },
        error: () => this.notify('Error deleting resource.', 'error')
      });
    });
  }

  // ── View & Download ────────────────────────────────────────────────────────
  openFile(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  downloadFile(fileUrl: string, title: string): void {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = title || 'resource';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  fileIcon(type: string): string {
    const map: Record<string, string> = { PDF: '📄', AUDIO: '🎵', DOCX: '📝', IMAGE: '🖼️' };
    return map[type] || '📄';
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

  trackById(_: number, r: LearningResource): number { return r.id!; }
}

export { ResourcesComponent as Resources };
