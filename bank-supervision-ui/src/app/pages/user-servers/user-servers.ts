import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface UserServerItem {
  name: string;
  ip: string;
  port: number;
  os: string;
  status: 'Online' | 'Warning' | 'Offline' | 'Maintenance';
  lastCheck: string;
  location: string;
  cpu: number;
  ram: number;
  storage: number;
  uptime: string;
  owner: string;
  description: string;
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

  searchTerm = '';
  currentPage = 1;
  pageSize = 6;
  showProfileCard = false;

  currentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bank.com',
    status: 'Connecté',
    image: 'assets/profil.png'
  };

  servers: UserServerItem[] = [
    {
      name: 'SRV-01',
      ip: '192.168.1.10',
      port: 22,
      os: 'Linux',
      status: 'Online',
      lastCheck: '10:00',
      location: 'Datacenter A',
      cpu: 42,
      ram: 58,
      storage: 64,
      uptime: '12 jours',
      owner: 'Infrastructure',
      description: 'Serveur applicatif principal.'
    },
    {
      name: 'SRV-02',
      ip: '192.168.1.11',
      port: 80,
      os: 'Ubuntu',
      status: 'Warning',
      lastCheck: '09:20',
      location: 'Datacenter A',
      cpu: 76,
      ram: 81,
      storage: 69,
      uptime: '8 jours',
      owner: 'Web Team',
      description: 'Serveur web avec charge élevée.'
    },
    {
      name: 'SRV-03',
      ip: '192.168.1.12',
      port: 22,
      os: 'Windows',
      status: 'Offline',
      lastCheck: '08:45',
      location: 'Datacenter B',
      cpu: 0,
      ram: 0,
      storage: 52,
      uptime: 'Indisponible',
      owner: 'Ops Team',
      description: 'Serveur arrêté pour incident technique.'
    },
    {
      name: 'SRV-04',
      ip: '192.168.1.13',
      port: 21,
      os: 'Debian',
      status: 'Maintenance',
      lastCheck: '11:10',
      location: 'Datacenter B',
      cpu: 18,
      ram: 33,
      storage: 41,
      uptime: 'Maintenance',
      owner: 'Infrastructure',
      description: 'Serveur en cours de maintenance planifiée.'
    },
    {
      name: 'SRV-05',
      ip: '192.168.1.14',
      port: 22,
      os: 'Linux',
      status: 'Online',
      lastCheck: '12:00',
      location: 'Datacenter C',
      cpu: 36,
      ram: 48,
      storage: 57,
      uptime: '21 jours',
      owner: 'Platform Team',
      description: 'Serveur de traitement batch.'
    },
    {
      name: 'SRV-06',
      ip: '192.168.1.15',
      port: 443,
      os: 'Ubuntu',
      status: 'Warning',
      lastCheck: '12:15',
      location: 'Datacenter C',
      cpu: 69,
      ram: 73,
      storage: 78,
      uptime: '15 jours',
      owner: 'Security Team',
      description: 'Serveur exposé HTTPS avec alertes mémoire.'
    },
    {
      name: 'SRV-07',
      ip: '192.168.1.16',
      port: 3306,
      os: 'CentOS',
      status: 'Online',
      lastCheck: '12:45',
      location: 'Datacenter D',
      cpu: 49,
      ram: 54,
      storage: 62,
      uptime: '33 jours',
      owner: 'DB Team',
      description: 'Base de données secondaire.'
    },
    {
      name: 'SRV-08',
      ip: '192.168.1.17',
      port: 8080,
      os: 'Rocky Linux',
      status: 'Maintenance',
      lastCheck: '13:10',
      location: 'Datacenter D',
      cpu: 12,
      ram: 22,
      storage: 45,
      uptime: 'Maintenance',
      owner: 'Middleware',
      description: 'Serveur middleware en mise à jour.'
    }
  ];

  selectedServer: UserServerItem = this.servers[0];

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const savedUser =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    if (!savedUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = {
      fullName:
        savedUser.fullName ||
        savedUser.name ||
        savedUser.userName ||
        savedUser.username ||
        'Utilisateur',
      username:
        savedUser.username ||
        savedUser.userName ||
        savedUser.name ||
        'user1',
      role: savedUser.role || 'Utilisateur',
      email: savedUser.email || 'user@bank.com',
      status: savedUser.status || 'Connecté',
      image: savedUser.image || savedUser.photo || 'assets/profil.png'
    };
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
    const online = this.servers.filter(s => s.status === 'Online').length;
    const warning = this.servers.filter(s => s.status === 'Warning').length;
    const maintenance = this.servers.filter(s => s.status === 'Maintenance').length;

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
    if (event) {
      event.stopPropagation();
    }
    this.showProfileCard = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileCard = false;
  }

  logout(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.showProfileCard = false;

    if (!this.isBrowser) return;

    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
