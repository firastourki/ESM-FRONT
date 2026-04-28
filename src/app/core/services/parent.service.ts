import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponseDto, PageResponse } from './user.service';

export interface ParentCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface ParentUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class ParentService {
  private readonly API = `${environment.apiUrl}/api/parents`;
  private http = inject(HttpClient);

  listParents(page: number, size: number): Observable<PageResponse<UserResponseDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');
    return this.http.get<PageResponse<UserResponseDto>>(this.API, { params });
  }

  getParent(id: string): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.API}/${id}`);
  }

  createParent(body: ParentCreateRequest): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(this.API, body);
  }

  updateParent(id: string, body: ParentUpdateRequest): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.API}/${id}`, body);
  }

  deleteParent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getMyChildren(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.API}/me/children`);
  }

  getChildren(parentId: string): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.API}/${parentId}/children`);
  }

  assignChild(parentId: string, childId: string): Observable<UserResponseDto> {
    return this.http.post<UserResponseDto>(`${this.API}/${parentId}/children/${childId}`, {});
  }

  removeChild(parentId: string, childId: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${parentId}/children/${childId}`);
  }
}
