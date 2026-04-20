import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

export interface DashboardStats {
  totalServers: number;
  active: number;
  warnings: number;
  critical: number;
}

export interface ServerRow {
  server: string;
  ipAddress: string;
  status: string;
  time: string;
}

export interface ApplicationRow {
  app: string;
  type: string;
  severity: 'Warning' | 'Critical';
  time: string;
}

export interface ServerMetric {
  name: string;
  cpu: number;
  ram: number;
}

export interface DashboardResponse {
  totalServers: number;
  activeServers: number;
  warningServers: number;
  criticalServers: number;
  recentServers: ServerRow[];
  recentApplications: ApplicationRow[];
  serverMetrics: ServerMetric[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/dashboard';

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.apiUrl);
  }

  pollDashboardData(refreshMs = 7000): Observable<DashboardResponse> {
    return interval(refreshMs).pipe(
      startWith(0),
      switchMap(() => this.getDashboardData())
    );
  }
}
