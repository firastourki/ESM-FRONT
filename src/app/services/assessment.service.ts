import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Assessment {
  id?: number;
  title: string;
  courseName: string;
  type: string;
  status: string;
  className?: string;   // 🆕 groupe d'étudiants ciblé
  startDate?: string;
  endDate?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class AssessmentService {

  private assessmentsUrl = 'http://localhost:8080/api/assessments';
  private enumsUrl = 'http://localhost:8080/api/enums';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(this.assessmentsUrl);
  }

  getById(id: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.assessmentsUrl}/${id}`);
  }

  // 🆕 Récupère les assessments d'une classe spécifique (pour le dashboard étudiant)
  getByClassName(className: string): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.assessmentsUrl}/class/${className}`);
  }

  create(assessment: Assessment): Observable<Assessment> {
    return this.http.post<Assessment>(this.assessmentsUrl, assessment);
  }

  update(id: number, assessment: Assessment): Observable<Assessment> {
    return this.http.put<Assessment>(`${this.assessmentsUrl}/${id}`, assessment);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.assessmentsUrl}/${id}`, { observe: 'response' });
  }

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.enumsUrl}/types`);
  }

  getStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.enumsUrl}/statuses`);
  }
}
