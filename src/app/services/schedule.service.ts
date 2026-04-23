import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Schedule {
  id?: number;
  scheduled?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  courseId?: number;
  className?: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = `${environment.apiUrl}/api/schedules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl);
  }

  getById(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/${id}`);
  }

  getByCourse(courseId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/course/${courseId}`);
  }

  getByClassName(name: string): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/class?name=${encodeURIComponent(name)}`);
  }

  create(schedule: Schedule): Observable<Schedule> {
    return this.http.post<Schedule>(this.apiUrl, schedule);
  }

  update(id: number, schedule: Schedule): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl}/${id}`, schedule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}