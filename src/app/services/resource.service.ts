import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

export interface LearningResource {
  id?: number;
  title: string;
  type: string;
  published: boolean;
  fileUrl?: string;
  assessmentId: number;
}

@Injectable({ providedIn: 'root' })
export class ResourcesService {

  private api = `${environment.apiUrl}/api/resources`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  getByAssessment(assessmentId: number): Observable<LearningResource[]> {
    return this.http.get<LearningResource[]>(`${this.api}/assessment/${assessmentId}`);
  }

  upload(formData: FormData): Observable<any> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return this.http.post(`${this.api}/upload`, formData, { headers });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { observe: 'response' });
  }
}
