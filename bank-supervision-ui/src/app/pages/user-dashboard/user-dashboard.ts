import { Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatBot } from '../chat-bot/chat-bot';
import {
  DashboardService,
  DashboardResponse,
  DashboardStats,
  ApplicationRow,
  ServerMetric
} from '../../services/dashboard.service';

interface AlertRow {
  server: string;
  type: string;
  severity: 'Warning' | 'Critical';
  time: string;
}

interface CurrentUser {
  fullName: string;
  username: string;
  role: string;
  email: string;
  status: string;
  image: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatBot],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboard implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  private readonly dashboardRefreshMs = 10000;
  private destroy$ = new Subject<void>();
  private nameRotateHandle?: ReturnType<typeof setInterval>;
  private applicationRotateHandle?: ReturnType<typeof setInterval>;
  private readonly nameRotateIntervalMs = 10000;
  private selectedIndex = 0;
  private serverSectionPaused = false;
  private pendingServerSectionData?: DashboardResponse;
  private serverWindowStart = 0;
  private appWindowStart = 0;
  private allRecentServers: AlertRow[] = [];
  private allApplications: ApplicationRow[] = [];

  stats: DashboardStats = {
    totalServers: 0,
    active: 0,
    warnings: 0,
    critical: 0
  };

  rows: AlertRow[] = [];
  applications: ApplicationRow[] = [];
  serverMetrics: ServerMetric[] = [];
  selectedServer: ServerMetric = { name: '-', cpu: 0, ram: 0 };

  loading = false;
  errorMessage = '';
  showProfileCard = false;
  showChatbot = false;

  currentUser: CurrentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bct.local',
    status: 'Connecte',
    image: 'assets/profil.png'
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.restoreUserFromStorage();

    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.pollDashboardData(this.dashboardRefreshMs)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.applyDashboardData(data),
        error: (error) => {
          console.error('Erreur chargement dashboard utilisateur :', error);
          this.errorMessage = 'Impossible de charger les donnees du dashboard.';
          this.finishLoading();
        }
      });

    this.startNameRotation();
    this.startApplicationRotation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopNameRotation();
    this.stopApplicationRotation();
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

  selectServer(serverName: string): void {
    const idx = this.serverMetrics.findIndex((server) => server.name === serverName);
    if (idx >= 0) {
      this.selectedIndex = idx;
      this.selectedServer = this.serverMetrics[idx];
    }
  }

  toggleProfileCard(event: MouseEvent): void {
    event.stopPropagation();
    this.showProfileCard = !this.showProfileCard;
  }

  closeProfileCard(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showProfileCard = false;
  }

  toggleChatbot(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showChatbot = !this.showChatbot;
    this.showProfileCard = false;
  }

  closeChatbot(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showChatbot = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileCard = false;
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.showProfileCard = false;
    this.showChatbot = false;
  }

  logout(event?: MouseEvent): void {
    event?.stopPropagation();
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.showProfileCard = false;
    this.showChatbot = false;
    this.router.navigate(['/login']);
  }

  private restoreUserFromStorage(): void {
    const savedUser =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    if (!savedUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = {
      fullName: savedUser.fullName || savedUser.name || savedUser.userName || savedUser.username || 'Utilisateur',
      username: savedUser.username || savedUser.userName || savedUser.name || 'user1',
      role: savedUser.role || 'Utilisateur',
      email: savedUser.email || 'user@bct.local',
      status: savedUser.status || 'Connecte',
      image: savedUser.image || savedUser.photo || 'assets/profil.png'
    };
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

    this.allApplications = (data.recentApplications ?? []).map((app) => ({
      app: app.app,
      type: app.type,
      severity: app.severity,
      time: this.formatTime(app.time)
    }));
    this.applyApplicationSectionData();

    if (!this.serverSectionPaused) {
      this.applyServerSectionData(data);
    }

    this.finishLoading();
  }

  private applyServerSectionData(data: DashboardResponse): void {
    this.allRecentServers = (data.recentServers ?? []).map((row) => ({
      server: row.server,
      type: row.status || 'UNKNOWN',
      severity: this.mapStatusToSeverity(row.status),
      time: this.formatTime(row.time)
    }));

    if (this.serverWindowStart >= this.allRecentServers.length) {
      this.serverWindowStart = 0;
    }

    this.rows = this.sliceWindow(this.allRecentServers, this.serverWindowStart, 5);

    this.serverMetrics = (data.serverMetrics ?? []).map((server) => ({
      name: server.name,
      cpu: this.clampMetric(server.cpu),
      ram: this.clampMetric(server.ram)
    }));

    if (this.serverMetrics.length > 0) {
      if (this.selectedIndex >= this.serverMetrics.length) {
        this.selectedIndex = 0;
      }
      this.selectedServer = this.serverMetrics[this.selectedIndex];
    } else {
      this.selectedIndex = 0;
      this.selectedServer = { name: '-', cpu: 0, ram: 0 };
    }
  }

  private applyApplicationSectionData(): void {
    if (this.appWindowStart >= this.allApplications.length) {
      this.appWindowStart = 0;
    }

    this.applications = this.sliceWindow(this.allApplications, this.appWindowStart, 5);
  }

  private rotateServerSection(): void {
    this.rotateServer();
    this.rotateServerRowsWindow();
    this.cdr.detectChanges();
  }

  private rotateServer(): void {
    if (this.serverMetrics.length === 0) return;

    this.selectedIndex = (this.selectedIndex + 1) % this.serverMetrics.length;
    this.selectedServer = this.serverMetrics[this.selectedIndex];
  }

  private rotateServerRowsWindow(): void {
    if (this.allRecentServers.length > 5) {
      this.serverWindowStart = (this.serverWindowStart + 5) % this.allRecentServers.length;
    } else {
      this.serverWindowStart = 0;
    }
    this.rows = this.sliceWindow(this.allRecentServers, this.serverWindowStart, 5);
  }

  private rotateApplicationsWindow(): void {
    if (this.allApplications.length > 5) {
      this.appWindowStart = (this.appWindowStart + 5) % this.allApplications.length;
    } else {
      this.appWindowStart = 0;
    }
    this.applications = this.sliceWindow(this.allApplications, this.appWindowStart, 5);
    this.cdr.detectChanges();
  }

  private startNameRotation(): void {
    if (this.nameRotateHandle) return;
    this.nameRotateHandle = setInterval(() => this.rotateServerSection(), this.nameRotateIntervalMs);
  }

  private stopNameRotation(): void {
    if (!this.nameRotateHandle) return;
    clearInterval(this.nameRotateHandle);
    this.nameRotateHandle = undefined;
  }

  private startApplicationRotation(): void {
    if (this.applicationRotateHandle) return;
    this.applicationRotateHandle = setInterval(
      () => this.rotateApplicationsWindow(),
      this.nameRotateIntervalMs
    );
  }

  private stopApplicationRotation(): void {
    if (!this.applicationRotateHandle) return;
    clearInterval(this.applicationRotateHandle);
    this.applicationRotateHandle = undefined;
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

  private mapStatusToSeverity(status?: string): 'Warning' | 'Critical' {
    const normalized = (status || '').toLowerCase();
    if (
      normalized.includes('critical') ||
      normalized.includes('down') ||
      normalized.includes('offline') ||
      normalized.includes('error') ||
      normalized.includes('stop')
    ) {
      return 'Critical';
    }

    return 'Warning';
  }

  private formatTime(value?: string): string {
    if (!value) return '--:--';
    if (/^\d{2}:\d{2}$/.test(value)) return value;

    const date = new Date(value);
    if (isNaN(date.getTime())) return '--:--';

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

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
