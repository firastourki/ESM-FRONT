import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StudentSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  cin: string | null;
  avatarUrl: string | null;
}

export interface ClassResponse {
  id: number;
  name: string;
  level: string | null;
  specialty: string | null;
  description: string | null;
  createdAt: string;
  tutorId: string | null;
  tutorFirstName: string | null;
  tutorLastName: string | null;
  tutorEmail: string | null;
  studentCount: number;
  students: StudentSummary[];
}

export interface ClassCreateRequest {
  name: string;
  level?: string | null;
  specialty?: string | null;
  description?: string | null;
  tutorId?: string | null;
}

export interface ClassUpdateRequest {
  name?: string;
  level?: string | null;
  specialty?: string | null;
  description?: string | null;
  tutorId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ClassService {
  private readonly API = `${environment.apiUrl}/api/classes`;
  private http = inject(HttpClient);

  listClasses(): Observable<ClassResponse[]> {
    return this.http.get<ClassResponse[]>(this.API);
  }

  getClass(id: number): Observable<ClassResponse> {
    return this.http.get<ClassResponse>(`${this.API}/${id}`);
  }

  createClass(body: ClassCreateRequest): Observable<ClassResponse> {
    return this.http.post<ClassResponse>(this.API, body);
  }

  updateClass(id: number, body: ClassUpdateRequest): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.API}/${id}`, body);
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  assignStudent(classId: number, userId: string): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.API}/${classId}/students/${userId}`, {});
  }

  removeStudent(classId: number, userId: string): Observable<ClassResponse> {
    return this.http.delete<ClassResponse>(`${this.API}/${classId}/students/${userId}`);
  }

  assignTutor(classId: number, tutorId: string): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.API}/${classId}/tutor/${tutorId}`, {});
  }

  removeTutor(classId: number): Observable<ClassResponse> {
    return this.http.delete<ClassResponse>(`${this.API}/${classId}/tutor`);
  }
}
