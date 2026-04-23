import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Attendance {
  id?: number;
  attended?: number;
  studentName?: string;
  studentEmail?: string;
  courseId?: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/api/attendances`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.apiUrl);
  }

  getById(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
  }

  getByStudentEmail(email: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/student/${encodeURIComponent(email)}`);
  }

  getByCourse(courseId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/course/${courseId}`);
  }

  getByStudentAndCourse(email: string, courseId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/student/${encodeURIComponent(email)}/course/${courseId}`);
  }

  create(attendance: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(this.apiUrl, attendance);
  }

  update(id: number, attendance: Attendance): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/${id}`, attendance);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}