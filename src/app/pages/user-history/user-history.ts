import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ServerHistoryItem {
  day: string;
  date: string;
  cpu: number;
  ram: number;
  storage: number;
  availability: number;
  alerts: number;
  dominantIssue: string;
}

interface AppHistoryItem {
  day: string;
  activeUsers: number;
  latency: number;
  transactions: number;
  availability: number;
}

interface IncidentItem {
  id: number;
  server: string;
  service: string;
  rootCause: string;
  occurredAt: string;
  recoveredAt: string;
  duration: string;
  status: 'Résolu' | 'Surveillance' | 'Critique';
  impact: string;
  action: string;
}

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-history.html',
  styleUrls: ['./user-history.css']
})
export class UserHistory implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  userName = 'Utilisateur';
  userEmail = 'user@bank.com';
  searchTerm = '';

  serverHistory: ServerHistoryItem[] = [
    {
      day: 'Lun',
      date: '10/03/2026',
      cpu: 48,
      ram: 59,
      storage: 64,
      availability: 99,
      alerts: 1,
      dominantIssue: 'Surcharge mémoire légère'
    },
    {
      day: 'Mar',
      date: '11/03/2026',
      cpu: 54,
      ram: 63,
      storage: 65,
      availability: 98,
      alerts: 1,
      dominantIssue: 'Pic CPU sur SRV-02'
    },
    {
      day: 'Mer',
      date: '12/03/2026',
      cpu: 71,
      ram: 78,
      storage: 67,
      availability: 94,
      alerts: 3,
      dominantIssue: 'Redémarrage service API'
    },
    {
      day: 'Jeu',
      date: '13/03/2026',
      cpu: 58,
      ram: 61,
      storage: 67,
      availability: 97,
      alerts: 1,
      dominantIssue: 'Temps de réponse élevé'
    },
    {
      day: 'Ven',
      date: '14/03/2026',
      cpu: 82,
      ram: 86,
      storage: 69,
      availability: 91,
      alerts: 4,
      dominantIssue: 'Saturation RAM + file jobs'
    },
    {
      day: 'Sam',
      date: '15/03/2026',
      cpu: 45,
      ram: 53,
      storage: 68,
      availability: 99,
      alerts: 0,
      dominantIssue: 'Aucune anomalie critique'
    },
    {
      day: 'Dim',
      date: '16/03/2026',
      cpu: 39,
      ram: 47,
      storage: 68,
      availability: 100,
      alerts: 0,
      dominantIssue: 'Fonctionnement stable'
    }
  ];

  applicationHistory: AppHistoryItem[] = [
    { day: 'Lun', activeUsers: 145, latency: 118, transactions: 1220, availability: 99 },
    { day: 'Mar', activeUsers: 152, latency: 124, transactions: 1288, availability: 98 },
    { day: 'Mer', activeUsers: 134, latency: 189, transactions: 1102, availability: 95 },
    { day: 'Jeu', activeUsers: 149, latency: 141, transactions: 1264, availability: 97 },
    { day: 'Ven', activeUsers: 171, latency: 231, transactions: 1389, availability: 93 },
    { day: 'Sam', activeUsers: 121, latency: 104, transactions: 990, availability: 99 },
    { day: 'Dim', activeUsers: 116, latency: 97, transactions: 942, availability: 100 }
  ];

  incidents: IncidentItem[] = [
    {
      id: 1,
      server: 'SRV-02',
      service: 'Customer Portal',
      rootCause: 'Pic CPU causé par une requête SQL non optimisée et montée soudaine du trafic.',
      occurredAt: '12/03/2026 - 10:42',
      recoveredAt: '12/03/2026 - 11:18',
      duration: '36 min',
      status: 'Résolu',
      impact: 'Lenteur visible côté portail client.',
      action: 'Optimisation requête + purge cache applicatif.'
    },
    {
      id: 2,
      server: 'SRV-06',
      service: 'Mobile API',
      rootCause: 'Consommation RAM excessive après exécution batch et fuite mémoire sur worker.',
      occurredAt: '14/03/2026 - 08:15',
      recoveredAt: '14/03/2026 - 09:04',
      duration: '49 min',
      status: 'Critique',
      impact: 'API mobile indisponible partiellement.',
      action: 'Redémarrage service + limitation workers + analyse mémoire.'
    },
    {
      id: 3,
      server: 'SRV-04',
      service: 'Reporting Suite',
      rootCause: 'Maintenance prolongée après mise à jour des dépendances.',
      occurredAt: '13/03/2026 - 18:20',
      recoveredAt: '13/03/2026 - 19:05',
      duration: '45 min',
      status: 'Surveillance',
      impact: 'Rapports retardés pour les utilisateurs internes.',
      action: 'Rollback partiel + vérification jobs planifiés.'
    },
    {
      id: 4,
      server: 'SRV-01',
      service: 'Core Banking',
      rootCause: 'Temps de réponse élevé lié à une saturation temporaire de la file de transactions.',
      occurredAt: '11/03/2026 - 15:30',
      recoveredAt: '11/03/2026 - 15:52',
      duration: '22 min',
      status: 'Résolu',
      impact: 'Ralentissement ponctuel des opérations bancaires.',
      action: 'Vidage queue + augmentation des workers.'
    }
  ];

  selectedIncident: IncidentItem = this.incidents[0];

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const currentUser =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    this.userName = currentUser?.name || 'Utilisateur';
    this.userEmail = currentUser?.email || 'user@bank.com';
  }

  get summaryCards() {
    const avgCpu = Math.round(
      this.serverHistory.reduce((sum, item) => sum + item.cpu, 0) / this.serverHistory.length
    );

    const avgRam = Math.round(
      this.serverHistory.reduce((sum, item) => sum + item.ram, 0) / this.serverHistory.length
    );

    const avgAvailability = Math.round(
      this.serverHistory.reduce((sum, item) => sum + item.availability, 0) / this.serverHistory.length
    );

    const totalAlerts = this.serverHistory.reduce((sum, item) => sum + item.alerts, 0);

    return [
      { label: 'CPU moyen', value: `${avgCpu}%`, note: 'Charge hebdomadaire', tone: 'blue' },
      { label: 'RAM moyenne', value: `${avgRam}%`, note: 'Utilisation mémoire', tone: 'purple' },
      { label: 'Disponibilité', value: `${avgAvailability}%`, note: 'Uptime semaine', tone: 'green' },
      { label: 'Alertes 7 jours', value: `${totalAlerts}`, note: 'Incidents détectés', tone: 'red' }
    ];
  }

  get averageAvailability(): number {
    return Math.round(
      this.applicationHistory.reduce((sum, item) => sum + item.availability, 0) / this.applicationHistory.length
    );
  }

  get availabilityGauge(): string {
    const value = this.averageAvailability;
    return `conic-gradient(#2f80ff 0% ${value}%, rgba(255,255,255,.08) ${value}% 100%)`;
  }

  get maxLoadValue(): number {
    return Math.max(...this.serverHistory.map(item => Math.max(item.cpu, item.ram, item.storage)), 100);
  }

  get filteredIncidents(): IncidentItem[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.incidents.filter((item) => {
      return (
        !q ||
        item.server.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.rootCause.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.occurredAt.toLowerCase().includes(q)
      );
    });
  }

  selectIncident(item: IncidentItem): void {
    this.selectedIncident = item;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Critique':
        return 'critical';
      case 'Surveillance':
        return 'watch';
      default:
        return 'resolved';
    }
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}