import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ChatBot } from '../chat-bot/chat-bot';

interface DashboardStats {
  totalServers: number;
  active: number;
  warnings: number;
  critical: number;
}

interface AlertRow {
  server: string;
  type: string;
  severity: 'Warning' | 'Critical';
  time: string;
}

interface ApplicationRow {
  app: string;
  type: string;
  severity: 'Warning' | 'Critical';
  time: string;
}

interface ServerMetric {
  name: string;
  cpu: number;
  ram: number;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatBot],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboard implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  stats: DashboardStats = {
    totalServers: 12,
    active: 9,
    warnings: 2,
    critical: 1
  };

  rows: AlertRow[] = [
    { server: 'SRV-01', type: 'CPU élevé', severity: 'Warning', time: '10:00' },
    { server: 'SRV-02', type: 'RAM élevée', severity: 'Critical', time: '10:15' },
    { server: 'SRV-03', type: 'Disque presque plein', severity: 'Warning', time: '10:25' },
    { server: 'SRV-04', type: 'Service arrêté', severity: 'Critical', time: '10:40' },
    { server: 'SRV-05', type: 'Température élevée', severity: 'Warning', time: '11:00' }
  ];

  applications: ApplicationRow[] = [
    { app: 'Core Banking', type: 'Latence', severity: 'Warning', time: '10:05' },
    { app: 'API Gateway', type: 'Erreur 5xx', severity: 'Critical', time: '10:20' },
    { app: 'Authentication', type: 'CPU élevé', severity: 'Warning', time: '10:30' },
    { app: 'Reporting', type: 'Temps de réponse', severity: 'Warning', time: '10:45' }
  ];

  serverMetrics: ServerMetric[] = [
    { name: 'SRV-01', cpu: 72, ram: 64 },
    { name: 'SRV-02', cpu: 91, ram: 88 },
    { name: 'SRV-03', cpu: 67, ram: 58 },
    { name: 'SRV-04', cpu: 95, ram: 90 },
    { name: 'SRV-05', cpu: 61, ram: 52 }
  ];

  selectedServer: ServerMetric = this.serverMetrics[0];
  showProfileCard = false;
  showChatbot = false;

  currentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bct.local',
    status: 'Connecté',
    image: 'assets/profil.png'
  };

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
      email: savedUser.email || 'user@bct.local',
      status: savedUser.status || 'Connecté',
      image: savedUser.image || savedUser.photo || 'assets/profil.png'
    };
  }

  selectServer(serverName: string): void {
    const found = this.serverMetrics.find(server => server.name === serverName);
    if (found) {
      this.selectedServer = found;
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

  toggleChatbot(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.showChatbot = !this.showChatbot;
    this.showProfileCard = false;
  }

  closeChatbot(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
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
    if (event) {
      event.stopPropagation();
    }
    this.showProfileCard = false;
    this.showChatbot = false;
    this.router.navigate(['/login']);
  }
}
