import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CertificateResponse {
  certificateId: string;
  studentName: string;
  examTitle: string;
  score: number;
  downloadUrl: string;
  generatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CertificateService {

  private baseUrl = `${environment.apiUrl}/api/certificates`;

  constructor(private http: HttpClient) { }

  /**
   * Génère un certificat PDF et retourne son ID + URL de téléchargement
   */
  generateCertificate(data: {
    studentName: string;
    studentEmail: string;
    examTitle: string;
    score: number;
    maxScore: number;
    passedAt: string;
  }): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${this.baseUrl}/generate`, data);
  }

  /**
   * Ouvre le PDF dans un nouvel onglet
   */
  downloadCertificate(certificateId: string): void {
    window.open(`${this.baseUrl}/download/${certificateId}`, '_blank');
  }
}
