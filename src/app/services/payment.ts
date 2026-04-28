import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = `${environment.apiUrl}/api/payments`;

 

  constructor(private http: HttpClient) {}

  addPayment(payment: any) {
    return this.http.post(this.apiUrl, payment);
  }

  getAllPayments() {
    return this.http.get(this.apiUrl);
  }
  getAll() {
  return this.http.get<any[]>(this.apiUrl);
}

  update(id: number, payment: any) {
    return this.http.put(`${this.apiUrl}/${id}`, payment);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getByStudentEmail(email: string) {
    return this.http.get<any[]>(`${this.apiUrl}/by-student-email/${encodeURIComponent(email)}`);
  }

}
