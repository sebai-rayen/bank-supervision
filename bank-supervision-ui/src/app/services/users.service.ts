import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RoleType = 'ADMIN' | 'USER';

export interface PersonneResponse {
  id: number;
  nom: string;
  email: string;
  roleType: RoleType;
  active: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleType: RoleType;
  active?: boolean;
}

export interface UpdateUserRequest {
  nom: string;
  email: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/v1/admin/users';

  list(): Observable<PersonneResponse[]> {
    return this.http.get<PersonneResponse[]>(this.apiUrl);
  }

  create(req: CreateUserRequest): Observable<PersonneResponse> {
    return this.http.post<PersonneResponse>(this.apiUrl, req);
  }

  update(userId: number, req: UpdateUserRequest): Observable<PersonneResponse> {
    return this.http.put<PersonneResponse>(`${this.apiUrl}/${userId}`, req);
  }

  setActive(userId: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${userId}/active`, { active });
  }

  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}
