import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AssessmentService } from '../../services/assessment.service';
import { ResourcesService } from '../../services/resource.service';
import { CourseService } from '../../services/course.service';
import { forkJoin, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ActivityItem {
  icon: string;
  message: string;
  time: string;
}

interface UpcomingAlert {
  title: string;
  courseName: string;
  startDate: string;
  hoursLeft: number;
  urgency: 'soon' | 'urgent';
}

interface StudentClass {
  id: number;
  name: string;
  level: string;
  specialty: string;
  studentCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  totalStudents = 0;
  totalCourses = 0;
  totalAssessments = 0;
  totalResources = 0;
  totalClasses = 0;

  recentActivity: ActivityItem[] = [];
  upcomingAlerts: UpcomingAlert[] = [];
  classes: StudentClass[] = [];

  showClassForm = false;
  newClass = { name: '', level: '', specialty: '', description: '' };
  classError = '';
  classSuccess = '';

  private _lastAssessments = 0;
  private _lastResources = 0;

  constructor(
    private assessmentService: AssessmentService,
    private resourcesService: ResourcesService,
    private courseService: CourseService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadClasses();
  }

  loadData(): void {
    this.courseService.getAll().pipe(catchError(() => of([]))).subscribe(courses => {
      this.totalCourses = courses.length;
      this.cdr.detectChanges();
    });

    this.assessmentService.getAll().pipe(retry(2), catchError(() => of(null))).subscribe(data => {
      if (data === null) { this.cdr.detectChanges(); return; }

      this._lastAssessments = data.length;
      this.totalAssessments = data.length;

      const now = Date.now();
      this.upcomingAlerts = data
        .filter(a => a.startDate)
        .map(a => {
          const diff = new Date(a.startDate!).getTime() - now;
          const hoursLeft = diff / 3600000;
          return { a, hoursLeft };
        })
        .filter(({ hoursLeft }) => hoursLeft >= 1 && hoursLeft <= 48)
        .sort((x, y) => x.hoursLeft - y.hoursLeft)
        .map(({ a, hoursLeft }) => ({
          title: a.title,
          courseName: a.courseName,
          startDate: a.startDate!,
          hoursLeft: Math.floor(hoursLeft),
          urgency: (hoursLeft <= 6 ? 'urgent' : 'soon') as 'urgent' | 'soon'
        }));

      const assessmentActivity: ActivityItem[] = [...data].reverse().slice(0, 3).map(a => ({
        icon: '📝',
        message: `Assessment "${a.title}" — ${a.status}`,
        time: a.startDate ? this.formatRelative(a.startDate as string) : 'recently'
      }));

      this.recentActivity = assessmentActivity;
      this.cdr.detectChanges();

      if (data.length === 0) { this.totalResources = 0; this.cdr.detectChanges(); return; }

      const calls = data.slice(0, 5).map(a =>
        this.resourcesService.getByAssessment(a.id!).pipe(retry(1), catchError(() => of([])))
      );

      forkJoin(calls).pipe(catchError(() => of([]))).subscribe((results: any[][]) => {
        const allResources = (results as any[][]).flat();
        this._lastResources = allResources.length;
        this.totalResources = allResources.length;

        const resourceActivity: ActivityItem[] = [...allResources].reverse().slice(0, 3).map((r: any) => ({
          icon: '📁',
          message: `Resource "${r.title}" uploaded`,
          time: 'recently'
        }));

        this.recentActivity = [...assessmentActivity, ...resourceActivity].slice(0, 5);
        this.cdr.detectChanges();
      });
    });
  }

  loadClasses(): void {
    this.http.get<StudentClass[]>(`${environment.apiUrl}/api/classes`)
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.classes = data;
        this.totalClasses = data.length;
        // 🆕 Fix: explicit types for reduce
        let total = 0;
        data.forEach((c: StudentClass) => { total += c.studentCount || 0; });
        this.totalStudents = total;
        this.cdr.detectChanges();
      });
  }

  createClass(): void {
    if (!this.newClass.name.trim()) { this.classError = 'Class name is required.'; return; }
    this.classError = '';
    this.http.post<StudentClass>(`${environment.apiUrl}/api/classes`, this.newClass)
      .subscribe({
        next: created => {
          this.classes = [...this.classes, created];
          this.totalClasses = this.classes.length;
          this.showClassForm = false;
          this.newClass = { name: '', level: '', specialty: '', description: '' };
          this.classSuccess = `Class "${created.name}" created ✓`;
          setTimeout(() => { this.classSuccess = ''; this.cdr.detectChanges(); }, 3000);
          this.cdr.detectChanges();
        },
        error: () => { this.classError = 'Error creating class.'; this.cdr.detectChanges(); }
      });
  }

  deleteClass(id: number): void {
    this.http.delete(`${environment.apiUrl}/api/classes/${id}`)
      .subscribe({
        next: () => {
          this.classes = this.classes.filter(c => c.id !== id);
          this.totalClasses = this.classes.length;
          this.cdr.detectChanges();
        },
        error: () => { }
      });
  }

  dismissAlert(index: number): void {
    this.upcomingAlerts.splice(index, 1);
  }

  private formatRelative(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}min ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
