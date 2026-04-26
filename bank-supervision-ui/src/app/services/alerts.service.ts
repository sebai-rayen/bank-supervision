import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export type AlertSeverity = 'Warning' | 'Critical';

export interface IncomingAlertDto {
  id: number | null;
  server: string;
  subject: string;
  message: string;
  time: string;
  severity: AlertSeverity;
}

export interface ReceivedAlertDto {
  id: number;
  server: string;
  type: string;
  severity: AlertSeverity;
  email: string;
  subject: string;
  time: string;
  message: string;
}

export interface AdminAlertsResponse {
  latest: IncomingAlertDto | null;
  alerts: ReceivedAlertDto[];
  sentAlerts: UserAlertDto[];
}

export interface CreateAlertRequest {
  server: string;
  recipientEmail: string;
  type: string;
  severity: AlertSeverity;
  subject: string;
  message: string;
}

export interface UserAlertDto {
  id: number;
  server: string;
  type: string;
  severity: AlertSeverity;
  subject: string;
  message: string;
  recipientEmail: string;
  recipientName: string;
  sentBy: string;
  time: string;
  createdAt: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/alerts';

  getAdminAlerts(): Observable<AdminAlertsResponse> {
    return this.http.get<AdminAlertsResponse>(this.apiUrl);
  }

  createAlert(payload: CreateAlertRequest): Observable<UserAlertDto> {
    return this.http.post<UserAlertDto>(this.apiUrl, payload);
  }

  getMyAlerts(): Observable<UserAlertDto[]> {
    return this.http.get<UserAlertDto[]>(`${this.apiUrl}/my`);
  }

  pollMyAlerts(refreshMs = 7000): Observable<UserAlertDto[]> {
    return interval(refreshMs).pipe(
      switchMap(() => this.getMyAlerts())
    );
  }

  pollAdminAlerts(refreshMs = 7000): Observable<AdminAlertsResponse> {
    return interval(refreshMs).pipe(
      switchMap(() => this.getAdminAlerts())
    );
  }
}

