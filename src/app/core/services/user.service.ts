// src/app/core/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserResponseDto {
  id: string;
  uuid: string;
  cin: string | null;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  status: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  deletedAt: string | null;
  walletBalance?: number;
  parentEmail?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  cin?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
}

export interface UserUpdateRequest {
  cin?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  status?: string;
  role?: string;
}

export interface UserSelfUpdateRequest {
  cin?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/api/users`;
  private http = inject(HttpClient);

  listUsers(
    page: number,
    size: number,
    filters: {
      email?: string;
      firstName?: string;
      lastName?: string;
      cin?: string;
      phoneNumber?: string;
    }
  ): Observable<PageResponse<UserResponseDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');

    if (filters.email) params = params.set('email', filters.email);
    if (filters.firstName) params = params.set('firstName', filters.firstName);
    if (filters.lastName) params = params.set('lastName', filters.lastName);
    if (filters.cin) params = params.set('cin', filters.cin);
    if (filters.phoneNumber) params = params.set('phoneNumber', filters.phoneNumber);

    return this.http.get<PageResponse<UserResponseDto>>(this.API, { params });
  }

  createUser(body: UserCreateRequest): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(this.API, body);
  }

  updateUser(id: string, body: UserUpdateRequest): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.API}/${id}`, body);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getCurrentUser(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.API}/me`);
  }

  updateCurrentUser(body: UserSelfUpdateRequest): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.API}/me`, body);
  }

  uploadAvatar(file: File): Observable<UserResponseDto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UserResponseDto>(`${this.API}/me/avatar`, form);
  }

  getUserById(id: string): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.API}/${id}`);
  }

  findByEmail(email: string): Observable<PageResponse<UserResponseDto>> {
    return this.http.get<PageResponse<UserResponseDto>>(`${this.API}?email=${encodeURIComponent(email)}&size=1`);
  }

  getWallet(id: string): Observable<{ userId: string; walletBalance: number }> {
    return this.http.get<{ userId: string; walletBalance: number }>(`${this.API}/${id}/wallet`);
  }

  topupWallet(id: string, amount: number): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.API}/${id}/wallet/topup`, { amount });
  }

  deductWallet(id: string, amount: number): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.API}/${id}/wallet/deduct`, { amount });
  }

  setParentEmail(id: string, parentEmail: string): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.API}/${id}/parent-email`, { parentEmail });
  }
}
