import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DashboardService,
  DashboardResponse,
  DashboardStats,
  ServerRow,
  ApplicationRow,
  ServerMetric
} from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  private nameRotateHandle?: ReturnType<typeof setInterval>;
  private readonly nameRotateIntervalMs = 10000;
  private selectedIndex = 0;
  private baseMetricLocked = false;
  private serverWindowStart = 0;
  private appWindowStart = 0;
  private destroy$ = new Subject<void>();
  private serverSectionPaused = false;
  private pendingServerSectionData?: DashboardResponse;

  stats: DashboardStats = {
    totalServers: 0,
    active: 0,
    warnings: 0,
    critical: 0
  };

  rows: ServerRow[] = [];
  applications: ApplicationRow[] = [];
  serverMetrics: ServerMetric[] = [];
  selectedServer: ServerMetric = { name: '-', cpu: 0, ram: 0 };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.pollDashboardData(7000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.applyDashboardData(data),
        error: (error) => {
          console.error('Erreur chargement dashboard :', error);
          this.errorMessage = 'Impossible de charger les donnees du dashboard.';
          this.finishLoading();
        }
      });
    this.startNameRotation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopNameRotation();
  }

  pauseServerAutoRotate(): void {
    this.serverSectionPaused = true;
    this.stopNameRotation();
  }

  resumeServerAutoRotate(): void {
    this.serverSectionPaused = false;
    if (this.pendingServerSectionData) {
      this.applyServerSectionData(this.pendingServerSectionData);
      this.pendingServerSectionData = undefined;
    }
    this.startNameRotation();
  }

  loadDashboard(showLoading = true): void {
    if (showLoading) {
      this.loading = true;
      this.errorMessage = '';
    }

    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardResponse) => this.applyDashboardData(data),
        error: (error) => {
          console.error('Erreur chargement dashboard :', error);
          this.errorMessage = 'Impossible de charger les donnees du dashboard.';
          this.finishLoading();
        }
      });
  }

  selectServer(serverName: string): void {
    const foundIndex = this.serverMetrics.findIndex(server => server.name === serverName);
    if (foundIndex >= 0) {
      this.selectedIndex = foundIndex;
      this.selectedServer = this.serverMetrics[foundIndex];
      this.baseMetricLocked = true;
    }
  }

  private rotateServerName(): void {
    if (this.serverMetrics.length === 0) {
      return;
    }

    this.selectedIndex = (this.selectedIndex + 1) % this.serverMetrics.length;
    const nextName = this.serverMetrics[this.selectedIndex]?.name ?? '-';

    this.selectedServer = {
      name: nextName,
      cpu: this.selectedServer.cpu,
      ram: this.selectedServer.ram
    };
  }

  private startNameRotation(): void {
    if (this.nameRotateHandle) return;
    this.nameRotateHandle = setInterval(() => this.rotateServerName(), this.nameRotateIntervalMs);
  }

  private stopNameRotation(): void {
    if (!this.nameRotateHandle) return;
    clearInterval(this.nameRotateHandle);
    this.nameRotateHandle = undefined;
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }

  private applyDashboardData(data: DashboardResponse): void {
    if (this.serverSectionPaused) {
      this.pendingServerSectionData = data;
    }

    this.stats = {
      totalServers: data.totalServers ?? 0,
      active: data.activeServers ?? 0,
      warnings: data.warningServers ?? 0,
      critical: data.criticalServers ?? 0
    };

    const allApplications = data.recentApplications ?? [];
    if (allApplications.length > 5) {
      this.appWindowStart = (this.appWindowStart + 5) % allApplications.length;
    } else {
      this.appWindowStart = 0;
    }

    this.applications = this.sliceWindow(allApplications, this.appWindowStart, 5).map((app) => ({
      app: app.app,
      type: app.type,
      severity: app.severity,
      time: this.formatTime(app.time)
    }));

    if (!this.serverSectionPaused) {
      this.applyServerSectionData(data);
    }

    this.finishLoading();
  }

  private applyServerSectionData(data: DashboardResponse): void {
    const allServers = data.recentServers ?? [];
    if (allServers.length > 5) {
      this.serverWindowStart = (this.serverWindowStart + 5) % allServers.length;
    } else {
      this.serverWindowStart = 0;
    }

    this.rows = this.sliceWindow(allServers, this.serverWindowStart, 5).map((row) => ({
      server: row.server,
      ipAddress: row.ipAddress,
      status: row.status,
      time: this.formatTime(row.time)
    }));

    this.serverMetrics = (data.serverMetrics ?? []).map((server) => ({
      name: server.name,
      cpu: this.clampMetric(server.cpu),
      ram: this.clampMetric(server.ram)
    }));

    if (!this.baseMetricLocked && this.serverMetrics.length > 0) {
      this.selectedServer = this.serverMetrics[0];
      this.selectedIndex = 0;
      this.baseMetricLocked = true;
    }
  }

  private formatTime(value?: string): string {
    if (!value) return '--:--';

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '--:--';
    }

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private clampMetric(value?: number): number {
    if (value === null || value === undefined || isNaN(value)) return 0;
    if (value < 0) return 0;
    if (value > 100) return 100;
    return Math.round(value);
  }

  private sliceWindow<T>(items: T[], start: number, size: number): T[] {
    if (items.length <= size) {
      return items.slice(0, size);
    }

    const end = start + size;
    if (end <= items.length) {
      return items.slice(start, end);
    }

    const first = items.slice(start);
    const remaining = size - first.length;
    return first.concat(items.slice(0, remaining));
  }
}
