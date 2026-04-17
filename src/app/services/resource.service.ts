import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private api = 'http://localhost:8080/api/resources';

  constructor(private http: HttpClient) { }

  getByAssessment(assessmentId: number): Observable<LearningResource[]> {
    return this.http.get<LearningResource[]>(`${this.api}/assessment/${assessmentId}`);
  }

  upload(formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/upload`, formData);
  }

  // ⚠️ observe: 'response' pour gérer correctement le 204 No Content
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, { observe: 'response' });
  }
}
