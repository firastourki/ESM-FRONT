import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AttendanceService, Attendance } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-form.component.html'
})
export class AttendanceFormComponent implements OnInit {
  attendance: Attendance = {
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT'
  };
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadAttendance(+id);
    }
  }

  loadAttendance(id: number): void {
    this.loading = true;
    this.attendanceService.getById(id).subscribe({
      next: (data) => {
        this.attendance = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    
    if (this.isEdit) {
      this.attendanceService.update(this.attendance.attended!, this.attendance).subscribe({
        next: () => {
          this.router.navigate(['/attendance']);
        },
        error: (error) => {
          console.error('Error updating:', error);
          this.loading = false;
        }
      });
    } else {
      this.attendanceService.create(this.attendance).subscribe({
        next: () => {
          this.router.navigate(['/attendance']);
        },
        error: (error) => {
          console.error('Error creating:', error);
          this.loading = false;
        }
      });
    }
  }
}