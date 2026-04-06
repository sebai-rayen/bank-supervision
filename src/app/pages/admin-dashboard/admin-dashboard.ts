import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard {
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

  selectServer(serverName: string): void {
    const found = this.serverMetrics.find(server => server.name === serverName);
    if (found) {
      this.selectedServer = found;
    }
  }
}