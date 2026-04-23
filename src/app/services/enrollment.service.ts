import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Enrollment {
  id?: number;
  userId?: number;
  userUuid?: string;
  studentName?: string;
  courseId: number;
  status?: string;
  enrolledAt?: string;
  completedAt?: string;
  progressPercent?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/enrollments`;

  constructor(private http: HttpClient) {}

  getEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl);
  }

  getEnrollmentCountByCourse(): Observable<Map<number, number>> {
    return this.http.get<Enrollment[]>(this.apiUrl).pipe(
      map(list => {
        const countMap = new Map<number, number>();
        (list || []).forEach(e => {
          const cid = e.courseId;
          countMap.set(cid, (countMap.get(cid) || 0) + 1);
        });
        return countMap;
      })
    );
  }

  getEnrollment(id: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/${id}`);
  }

  createEnrollment(enrollment: Enrollment): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, enrollment);
  }

  getMyCourses(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/my-courses`);
  }

  getEnrollmentHistory(userId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/user/${userId}/history`);
  }

  getEnrollmentsByUser(userId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/user/${userId}`);
  }

  cancelEnrollment(id: number): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/${id}/cancel`, {});
  }

  updateEnrollment(id: number, enrollment: Enrollment): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/${id}`, enrollment);
  }

  deleteEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
