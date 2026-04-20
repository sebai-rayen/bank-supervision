import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  roleType?: string;
  active?: boolean;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role?: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/api/v1/auth';

  constructor(private http: HttpClient) {}

  /** Login */
  login(request: LoginRequest): Observable<AuthenticationResponse> {
    console.log('[AuthService] login request', request);
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(res => console.log('[AuthService] login response', res))
    );
  }

  /** Register */
  register(request: RegistrationRequest): Observable<void> {
    console.log('[AuthService] register request', request);
    return this.http.post<void>(`${this.baseUrl}/register`, request).pipe(
      tap(res => console.log('[AuthService] register response', res))
    );
  }

  /** Refresh token */
  refreshToken(request: RefreshRequest): Observable<AuthenticationResponse> {
    console.log('[AuthService] refreshToken request', request);
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/refresh`, request).pipe(
      tap(res => console.log('[AuthService] refreshToken response', res))
    );
  }
}
