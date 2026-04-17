import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assessment } from './assessment.service';

@Injectable({ providedIn: 'root' })
export class PlanningService {

  private api = 'http://localhost:8080/api/planning';

  constructor(private http: HttpClient) { }

  getCalendar(year: number, month: number): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.api}/calendar?year=${year}&month=${month}`);
  }

  getUpcoming(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.api}/upcoming`);
  }

  getOngoing(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.api}/ongoing`);
  }
}
