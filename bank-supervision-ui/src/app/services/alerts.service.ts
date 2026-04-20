import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

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
  time: string;
  message: string;
}

export interface AdminAlertsResponse {
  latest: IncomingAlertDto | null;
  alerts: ReceivedAlertDto[];
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

  pollAdminAlerts(refreshMs = 7000): Observable<AdminAlertsResponse> {
    return interval(refreshMs).pipe(
      startWith(0),
      switchMap(() => this.getAdminAlerts())
    );
  }
}

