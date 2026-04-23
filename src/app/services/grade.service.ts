import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Grade {
  id?: number;
  assessmentId: number;
  studentName: string;
  studentEmail: string;
  score: number;
  maxScore: number;
  comments?: string;
  gradedAt?: string;
  percentage?: number;
  mention?: string;
}

export interface GradeStats {
  total: number;
  average: number;
  max: number;
  min: number;
  passing: number;
  failing: number;
  passRate: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  studentEmail: string;
  averagePercentage?: number;
  averageScore?: number;
  totalAssessments?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
  mention: string;
  comments?: string;
}

@Injectable({ providedIn: 'root' })
export class GradeService {

  private api = `${environment.apiUrl}/api/grades`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(this.api);
  }

  getById(id: number): Observable<Grade> {
    return this.http.get<Grade>(`${this.api}/${id}`);
  }

  getByAssessment(assessmentId: number): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.api}/assessment/${assessmentId}`);
  }

  getByStudent(email: string): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.api}/student/${email}`);
  }

  getStatsByAssessment(assessmentId: number): Observable<GradeStats> {
    return this.http.get<GradeStats>(`${this.api}/assessment/${assessmentId}/stats`);
  }

  getGlobalLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.api}/leaderboard`);
  }

  getLeaderboardByAssessment(assessmentId: number): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.api}/leaderboard/assessment/${assessmentId}`);
  }

  create(grade: Grade): Observable<Grade> {
    return this.http.post<Grade>(this.api, grade);
  }

  update(id: number, grade: Grade): Observable<Grade> {
    return this.http.put<Grade>(`${this.api}/${id}`, grade);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { observe: 'response' });
  }
}
