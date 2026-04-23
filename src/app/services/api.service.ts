import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private attendanceApi = `${environment.apiUrl}/api/attendances`;
  private scheduleApi = `${environment.apiUrl}/api/schedules`;

  constructor(private http: HttpClient) {}

  // Attendance endpoints
  getAttendances(): Observable<any> {
    return this.http.get(this.attendanceApi);
  }

  // Schedule endpoints
  getSchedules(): Observable<any> {
    return this.http.get(this.scheduleApi);
  }
}