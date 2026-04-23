import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, map } from 'rxjs';
import { PlanningService } from '../../services/planning.service';
import { AssessmentService, Assessment } from '../../services/assessment.service';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  assessments: Assessment[];
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css']
})
export class Planning implements OnInit {

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  calendarDays: CalendarDay[] = [];
  calendarAssessments: Assessment[] = [];

  upcomingAssessments: Assessment[] = [];
  ongoingAssessments: Assessment[] = [];

  selectedDay: CalendarDay | null = null;

  showForm = false;
  formError = '';
  form: any = {};

  assessmentTypes: string[] = ['EXAM', 'QUIZ', 'PROJECT'];
  assessmentStatuses: string[] = ['DRAFT', 'PUBLISHED', 'CLOSED'];

  loading = false;

  notification: { message: string; type: 'success' | 'error' } | null = null;

  readonly MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  readonly DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    private planningService: PlanningService,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCalendar();
    this.loadUpcoming();
    this.loadEnums();
  }

  private refresh(): void { this.cdr.detectChanges(); }

  loadCalendar(): void {
    this.loading = true;
    this.planningService.getCalendar(this.currentYear, this.currentMonth).pipe(
      catchError(() => this.assessmentService.getAll())
    ).subscribe({
      next: data => {
        this.calendarAssessments = data || [];
        this.buildCalendar();
        this.loading = false;
        this.refresh();
      },
      error: () => {
        this.loading = false;
        this.buildCalendar();
        this.refresh();
      }
    });
  }

  loadUpcoming(): void {
    const now = Date.now();
    this.planningService.getUpcoming().pipe(
      catchError(() => this.assessmentService.getAll().pipe(
        map(all => all.filter(a => a.startDate && new Date(a.startDate as any).getTime() > now))
      ))
    ).subscribe({
      next: data => { this.upcomingAssessments = data; this.refresh(); },
      error: () => {}
    });

    this.planningService.getOngoing().pipe(
      catchError(() => this.assessmentService.getAll().pipe(
        map(all => all.filter(a => {
          if (!a.startDate || !a.endDate) return false;
          const start = new Date(a.startDate as any).getTime();
          const end = new Date(a.endDate as any).getTime();
          return start <= now && end >= now;
        }))
      ))
    ).subscribe({
      next: data => { this.ongoingAssessments = data; this.refresh(); },
      error: () => {}
    });
  }

  loadEnums(): void {
    this.assessmentService.getTypes().subscribe({
      next: data => { this.assessmentTypes = data; this.refresh(); },
      error: () => { }
    });
    this.assessmentService.getStatuses().subscribe({
      next: data => { this.assessmentStatuses = data; this.refresh(); },
      error: () => { }
    });
  }

  buildCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const today = new Date();

    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    this.calendarDays = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(this.currentYear, this.currentMonth - 1, -i);
      this.calendarDays.push(this.makeDay(d, false, today));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth - 1, d);
      this.calendarDays.push(this.makeDay(date, true, today));
    }

    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      this.calendarDays.push(this.makeDay(date, false, today));
    }
  }

  makeDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const assessments = this.calendarAssessments.filter(a => {
      if (!a.startDate) return false;
      const aDate = new Date(a.startDate as any);
      return aDate.getFullYear() === date.getFullYear() &&
        aDate.getMonth() === date.getMonth() &&
        aDate.getDate() === date.getDate();
    });
    return {
      date,
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      assessments
    };
  }

  prevMonth(): void {
    if (this.currentMonth === 1) { this.currentMonth = 12; this.currentYear--; }
    else { this.currentMonth--; }
    this.selectedDay = null;
    this.loadCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) { this.currentMonth = 1; this.currentYear++; }
    else { this.currentMonth++; }
    this.selectedDay = null;
    this.loadCalendar();
  }

  goToToday(): void {
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth() + 1;
    this.selectedDay = null;
    this.loadCalendar();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = day;
    this.refresh();
  }

  openForm(day?: CalendarDay): void {
    const defaultDate = day
      ? this.formatDateTimeLocal(day.date)
      : this.formatDateTimeLocal(new Date());
    this.form = {
      title: '', courseName: '',
      type: 'EXAM', status: 'DRAFT',
      startDate: defaultDate, endDate: defaultDate, duration: 60
    };
    this.formError = '';
    this.showForm = true;
    this.refresh();
  }

  cancelForm(): void {
    this.showForm = false;
    this.formError = '';
    this.refresh();
  }

  submitForm(): void {
    if (!this.form.title?.trim() || !this.form.courseName?.trim()) {
      this.formError = 'Title and course name are required.';
      this.refresh();
      return;
    }
    const payload: any = {
      title: this.form.title.trim(),
      courseName: this.form.courseName.trim(),
      type: this.form.type,
      status: this.form.status,
      startDate: this.form.startDate || null,
      endDate: this.form.endDate || null,
      duration: this.form.duration || null
    };
    this.assessmentService.create(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.loadCalendar();
        this.loadUpcoming();
        this.showNotif('Assessment scheduled successfully ✓', 'success');
        this.refresh();
      },
      error: () => {
        this.formError = 'Error creating assessment. Please try again.';
        this.refresh();
      }
    });
  }

  get monthLabel(): string {
    return `${this.MONTHS[this.currentMonth - 1]} ${this.currentYear}`;
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(dateStr: any): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  formatCountdown(dateStr: any): string {
    if (!dateStr) return '';
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return 'Past';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `In ${days}d ${hours}h`;
    if (hours > 0) return `In ${hours}h ${mins}min`;
    return `In ${mins}min`;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PUBLISHED: '#22c55e',
      DRAFT: '#f59e0b',
      CLOSED: '#94a3b8'
    };
    return map[status] || '#6366f1';
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      EXAM: '📝',
      QUIZ: '⚡',
      PROJECT: '🏗️'
    };
    return map[type] || '📋';
  }

  showNotif(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    this.refresh();
    setTimeout(() => { this.notification = null; this.refresh(); }, 3000);
  }
}
