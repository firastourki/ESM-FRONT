import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { catchError } from 'rxjs/operators';
import { of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MyClass {
  id: number; name: string; level: string | null;
  specialty: string | null; studentCount: number;
}

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './tutor-dashboard.html',
  styleUrls: ['./tutor-dashboard.css']
})
export class TutorDashboard implements OnInit {

  tutorName  = '';
  myClasses: MyClass[] = [];

  totalCount = 0; publishedCount = 0; draftCount = 0; closedCount = 0;
  recentAssessments: Assessment[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/api/users/me`).pipe(
      catchError(() => of(null)),
      switchMap(profile => {
        if (profile) this.tutorName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email;
        const tutorId = profile?.id ?? profile?.uuid ?? '';
        return this.http.get<any[]>(`${environment.apiUrl}/api/classes`).pipe(
          catchError(() => of([])),
          switchMap(classes => {
            this.myClasses = (classes || [])
              .filter((c: any) => c.tutorId === tutorId)
              .map((c: any) => ({ id: c.id, name: c.name, level: c.level ?? null, specialty: c.specialty ?? null, studentCount: c.studentCount ?? 0 }));
            return this.assessmentService.getAll().pipe(catchError(() => of([])));
          })
        );
      })
    ).subscribe((assessments: Assessment[]) => {
      const all = assessments || [];
      this.totalCount     = all.length;
      this.publishedCount = all.filter(a => a.status === 'PUBLISHED').length;
      this.draftCount     = all.filter(a => a.status === 'DRAFT').length;
      this.closedCount    = all.filter(a => a.status === 'CLOSED').length;
      // Show 5 most recent (last in array = most recently created)
      this.recentAssessments = [...all].reverse().slice(0, 5);
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  statusClass(s: string): string { return ({ PUBLISHED:'badge-published', DRAFT:'badge-draft', CLOSED:'badge-closed' } as any)[s] || 'badge-default'; }
  typeClass(t: string):   string { return ({ EXAM:'badge-exam', QUIZ:'badge-quiz', PROJECT:'badge-project' } as any)[t] || 'badge-default'; }

  private readonly CARD_GRADIENTS = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  ];
  cardGradient(i: number): string { return this.CARD_GRADIENTS[i % this.CARD_GRADIENTS.length]; }
}
