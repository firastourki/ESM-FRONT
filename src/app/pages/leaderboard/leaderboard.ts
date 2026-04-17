import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GradeService, LeaderboardEntry } from '../../services/grade.service';
import { AssessmentService, Assessment } from '../../services/assessment.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.css']
})
export class LeaderboardComponent implements OnInit {

  mode: 'global' | 'assessment' = 'global';

  globalEntries: LeaderboardEntry[] = [];
  assessmentEntries: LeaderboardEntry[] = [];

  assessments: Assessment[] = [];
  selectedAssessmentId: number | null = null;

  loadingGlobal = false;
  loadingAssessment = false;

  searchQuery = '';

  constructor(
    private gradeService: GradeService,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadGlobal();
    this.loadAssessments();
  }

  private refresh(): void { this.cdr.detectChanges(); }

  loadGlobal(): void {
    this.loadingGlobal = true;
    this.gradeService.getGlobalLeaderboard().subscribe({
      next: data => {
        this.globalEntries = data;
        this.loadingGlobal = false;
        this.refresh();
      },
      error: () => { this.loadingGlobal = false; this.refresh(); }
    });
  }

  loadAssessments(): void {
    this.assessmentService.getAll().subscribe({
      next: data => { this.assessments = data; this.refresh(); },
      error: () => { }
    });
  }

  loadAssessmentLeaderboard(): void {
    if (!this.selectedAssessmentId) return;
    this.loadingAssessment = true;
    this.gradeService.getLeaderboardByAssessment(this.selectedAssessmentId).subscribe({
      next: data => {
        this.assessmentEntries = data;
        this.loadingAssessment = false;
        this.refresh();
      },
      error: () => { this.loadingAssessment = false; this.refresh(); }
    });
  }

  onAssessmentChange(): void {
    this.assessmentEntries = [];
    this.loadAssessmentLeaderboard();
  }

  setMode(m: 'global' | 'assessment'): void {
    this.mode = m;
    this.searchQuery = '';
    this.refresh();
  }

  get currentEntries(): LeaderboardEntry[] {
    const list = this.mode === 'global' ? this.globalEntries : this.assessmentEntries;
    if (!this.searchQuery) return list;
    return list.filter(e =>
      e.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      e.studentEmail.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get top3(): LeaderboardEntry[] {
    return this.currentEntries.slice(0, 3);
  }

  get rest(): LeaderboardEntry[] {
    return this.currentEntries.slice(3);
  }

  medalEmoji(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  mentionClass(mention: string): string {
    const map: Record<string, string> = {
      EXCELLENT: 'mention-excellent',
      GOOD: 'mention-good',
      AVERAGE: 'mention-average',
      FAIL: 'mention-fail'
    };
    return map[mention] || '';
  }

  barColor(pct: number): string {
    if (pct >= 75) return '#22c55e';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  }

  getPct(entry: LeaderboardEntry): number {
    return entry.averagePercentage ?? entry.percentage ?? 0;
  }

  get selectedAssessment(): Assessment | undefined {
    return this.assessments.find(a => a.id === this.selectedAssessmentId);
  }
}
