import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Schedule {
  scheduled?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = 'http://localhost:8080/api/schedules';  // DOUBLE-CHECK THIS URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<Schedule[]> {
    console.log('Fetching from:', this.apiUrl);  // ADD THIS for debugging
    return this.http.get<Schedule[]>(this.apiUrl);
  }

  getById(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/${id}`);
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