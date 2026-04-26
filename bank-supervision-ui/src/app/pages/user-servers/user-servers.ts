import { Component, HostListener, OnInit, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ServerApi, ServerService } from '../../services/server.service';

type UserServerStatus = 'Online' | 'Warning' | 'Offline' | 'Maintenance';

interface UserServerItem {
  id?: number;
  name: string;
  ip: string;
  port: number;
  os: string;
  status: UserServerStatus;
  lastCheck: string;
  location: string;
  cpu: number;
  ram: number;
  storage: number;
  uptime: string;
  owner: string;
  description: string;
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
  selector: 'app-user-servers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-servers.html',
  styleUrls: ['./user-servers.css']
})
export class UserServers implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private serverService = inject(ServerService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm = '';
  currentPage = 1;
  pageSize = 6;
  showProfileCard = false;

  loading = false;
  errorMessage = '';

  currentUser: CurrentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bank.com',
    status: 'Connecte',
    image: 'assets/profil.png'
  };

  servers: UserServerItem[] = [];
  selectedServer: UserServerItem = this.createEmptyServer();

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const hasUser = this.restoreUserFromStorage();
    if (!hasUser) return;
    this.loadServers();
  }

  get filteredServers(): UserServerItem[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.servers.filter((server) => {
      return (
        !q ||
        server.name.toLowerCase().includes(q) ||
        server.ip.toLowerCase().includes(q) ||
        server.os.toLowerCase().includes(q) ||
        server.status.toLowerCase().includes(q) ||
        server.location.toLowerCase().includes(q)
      );
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredServers.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedServers(): UserServerItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredServers.slice(start, start + this.pageSize);
  }

  get summary() {
    const total = this.servers.length;
    const online = this.servers.filter((s) => s.status === 'Online').length;
    const warning = this.servers.filter((s) => s.status === 'Warning').length;
    const maintenance = this.servers.filter((s) => s.status === 'Maintenance').length;

    return [
      { label: 'Mes serveurs', value: total, tone: 'blue' },
      { label: 'Online', value: online, tone: 'green' },
      { label: 'Warnings', value: warning, tone: 'yellow' },
      { label: 'Maintenance', value: maintenance, tone: 'purple' }
    ];
  }

  selectServer(server: UserServerItem): void {
    this.selectedServer = server;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void {
    this.changePage(this.currentPage - 1);
  }

  nextPage(): void {
    this.changePage(this.currentPage + 1);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Online':
        return 'online';
      case 'Warning':
        return 'warning';
      case 'Offline':
        return 'offline';
      default:
        return 'maintenance';
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

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileCard = false;
  }

  logout(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showProfileCard = false;

    if (!this.isBrowser) return;

    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private loadServers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.serverService.getServers().subscribe({
      next: (servers) => {
        this.servers = servers.map((server) => this.mapApiToUi(server));
        this.currentPage = 1;
        this.selectedServer = this.servers[0] || this.createEmptyServer();
        this.finishLoading();
      },
      error: (error) => {
        console.error('Erreur chargement user servers :', error);
        if (error?.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error?.status === 403) {
          this.errorMessage = 'Accès refusé à la liste des serveurs.';
        } else if (error?.status === 0) {
          this.errorMessage = 'Impossible de joindre le serveur (réseau/CORS).';
        } else {
          this.errorMessage = 'Impossible de charger les serveurs.';
        }
        this.servers = [];
        this.selectedServer = this.createEmptyServer();
        this.finishLoading();
      }
    });
  }

  private restoreUserFromStorage(): boolean {
    const savedUser = this.readCurrentUserFromStorage();

    if (!savedUser) {
      this.router.navigate(['/login']);
      return false;
    }

    this.currentUser = {
      fullName: savedUser.fullName || savedUser.name || savedUser.userName || savedUser.username || 'Utilisateur',
      username: savedUser.username || savedUser.userName || savedUser.name || 'user1',
      role: savedUser.role || 'Utilisateur',
      email: savedUser.email || 'user@bank.com',
      status: savedUser.status || 'Connecte',
      image: savedUser.image || savedUser.photo || 'assets/profil.png'
    };

    return true;
  }

  private readCurrentUserFromStorage(): any | null {
    try {
      const fromLocal = localStorage.getItem('currentUser');
      const fromSession = sessionStorage.getItem('currentUser');
      return JSON.parse(fromLocal || 'null') || JSON.parse(fromSession || 'null');
    } catch {
      return null;
    }
  }

  private mapApiToUi(server: ServerApi): UserServerItem {
    const status = this.normalizeStatus(server.status);

    return {
      id: server.id,
      name: server.name || 'Serveur',
      ip: server.ipAddress || '-',
      port: server.port ?? 0,
      os: server.os || server.system || 'N/A',
      status,
      lastCheck: this.formatTime(server.lastCheck),
      location: 'Datacenter A',
      cpu: status === 'Offline' ? 0 : 40,
      ram: status === 'Offline' ? 0 : 50,
      storage: status === 'Offline' ? 0 : 45,
      uptime: status === 'Offline' ? 'Indisponible' : 'Actif',
      owner: this.currentUser.fullName || 'Utilisateur',
      description: 'Serveur supervise par votre compte utilisateur.'
    };
  }

  private normalizeStatus(status?: string): UserServerStatus {
    const value = (status || '').toLowerCase();

    if (value.includes('warn')) return 'Warning';
    if (value.includes('off') || value.includes('down') || value.includes('stop')) return 'Offline';
    if (value.includes('maint')) return 'Maintenance';
    return 'Online';
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

  private createEmptyServer(): UserServerItem {
    return {
      name: '-',
      ip: '-',
      port: 0,
      os: '-',
      status: 'Offline',
      lastCheck: '--:--',
      location: '-',
      cpu: 0,
      ram: 0,
      storage: 0,
      uptime: '-',
      owner: '-',
      description: '-'
    };
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
