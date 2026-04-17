import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService, Attendance } from '../../../services/attendance.service';
import { StudentService } from '../../../services/student.service';
import { AttendanceAnalyticsComponent } from '../attendance-analytics/attendance-analytics.component';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AttendanceAnalyticsComponent],
  templateUrl: './attendance-list.component.html'
})

export class AttendanceListComponent implements OnInit {
  attendances: Attendance[] = [];
  filteredAttendances: Attendance[] = [];
  loading = false;
  activeTab: 'list' | 'analytics' = 'list';
  
  // Filter properties
  searchTerm: string = '';
  selectedLevel: string = 'all';
  selectedStatus: string = 'all';
  selectedDate: string = '';
  
  // Stats
  totalPresent = 0;
  totalAbsent = 0;
  totalLate = 0;
  attendanceRate = 0;

  levels = ['Beginner', 'Intermediate', 'Advanced'];
  statuses = ['PRESENT', 'ABSENT', 'LATE'];

  constructor(
    private attendanceService: AttendanceService,
    public studentService: StudentService  // Made public for template access
  ) {}

  ngOnInit(): void {
    this.loadAttendances();
  }

  loadAttendances(): void {
    this.loading = true;
    this.attendanceService.getAll().subscribe({
      next: (data) => {
        this.attendances = data;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading attendances:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredAttendances = this.attendances.filter(att => {
      const student = this.studentService.getStudentById(att.attended!);
      const studentName = student ? student.name.toLowerCase() : '';
      const studentLevel = student ? student.level.toLowerCase() : '';
      
      // Search filter
      const matchesSearch = this.searchTerm === '' || 
        studentName.includes(this.searchTerm.toLowerCase());
      
      // Level filter
      const matchesLevel = this.selectedLevel === 'all' || 
        studentLevel === this.selectedLevel.toLowerCase();
      
      // Status filter
      const matchesStatus = this.selectedStatus === 'all' || 
        att.status === this.selectedStatus;
      
      // Date filter
      const matchesDate = this.selectedDate === '' || 
        att.date === this.selectedDate;
      
      return matchesSearch && matchesLevel && matchesStatus && matchesDate;
    });
  }

  calculateStats(): void {
    this.totalPresent = this.attendances.filter(a => a.status === 'PRESENT').length;
    this.totalAbsent = this.attendances.filter(a => a.status === 'ABSENT').length;
    this.totalLate = this.attendances.filter(a => a.status === 'LATE').length;
    
    const total = this.attendances.length;
    this.attendanceRate = total > 0 
      ? Math.round(((this.totalPresent + this.totalLate) / total) * 100) 
      : 0;
  }

  deleteAttendance(id: number): void {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      this.attendanceService.delete(id).subscribe({
        next: () => {
          this.loadAttendances();
        },
        error: (error) => console.error('Error deleting:', error)
      });
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'PRESENT': return '✅';
      case 'ABSENT': return '❌';
      case 'LATE': return '⏰';
      default: return '📝';
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedLevel = 'all';
    this.selectedStatus = 'all';
    this.selectedDate = '';
    this.filteredAttendances = this.attendances;
  }
 
}