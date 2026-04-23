import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { ResourcesService, LearningResource } from '../../services/resource.service';
import { environment } from '../../../environments/environment';

const UPLOADS_BASE = environment.apiUrl;

@Component({
  selector: 'app-assessment-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './assessment-details.html',
  styleUrls: ['./assessment-details.css']
})
export class AssessmentDetails implements OnInit {

  assessment?: Assessment;
  resources: LearningResource[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private resourceService: ResourcesService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'ID invalide.'; this.loading = false; return; }

    this.assessmentService.getById(id).subscribe({
      next: a => {
        this.assessment = a;
        this.resourceService.getByAssessment(id).subscribe({
          next: r => { this.resources = r; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.error = 'Assessment introuvable.'; this.loading = false; }
    });
  }

  openFile(fileUrl: string): void {
    window.open(`${UPLOADS_BASE}/${fileUrl}`, '_blank');
  }

  fileIcon(type: string): string {
    const map: Record<string, string> = { PDF: '📄', AUDIO: '🎵', DOCX: '📝', IMAGE: '🖼️' };
    return map[type] || '📄';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = { PUBLISHED: 'badge-published', DRAFT: 'badge-draft', CLOSED: 'badge-closed' };
    return map[status] || 'badge-default';
  }

  typeClass(type: string): string {
    const map: Record<string, string> = { EXAM: 'badge-exam', QUIZ: 'badge-quiz', PROJECT: 'badge-project' };
    return map[type] || 'badge-default';
  }
}
