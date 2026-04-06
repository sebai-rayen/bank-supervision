import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ApplicationItem {
  name: string;
  server: string;
  version: string;
  status: 'Running' | 'Warning' | 'Stopped';
  lastCheck: string;
}

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './application.html',
  styleUrls: ['./application.css']
})
export class Application {
  query = '';
  showAdd = false;

  applications: ApplicationItem[] = [
    {
      name: 'Core Banking',
      server: 'SRV-01',
      version: 'v3.2.1',
      status: 'Running',
      lastCheck: '09:20'
    },
    {
      name: 'Mobile Banking API',
      server: 'SRV-02',
      version: 'v2.8.4',
      status: 'Warning',
      lastCheck: '09:45'
    },
    {
      name: 'Internet Banking',
      server: 'SRV-03',
      version: 'v5.1.0',
      status: 'Running',
      lastCheck: '10:05'
    },
    {
      name: 'Payment Gateway',
      server: 'SRV-04',
      version: 'v4.0.7',
      status: 'Stopped',
      lastCheck: '10:30'
    },
    {
      name: 'Reporting Service',
      server: 'SRV-05',
      version: 'v1.9.3',
      status: 'Running',
      lastCheck: '10:50'
    }
  ];

  form: ApplicationItem = {
    name: '',
    server: '',
    version: '',
    status: 'Running',
    lastCheck: '--:--'
  };

  get filteredApplications(): ApplicationItem[] {
    const q = this.query.trim().toLowerCase();

    if (!q) {
      return this.applications;
    }

    return this.applications.filter(app =>
      app.name.toLowerCase().includes(q) ||
      app.server.toLowerCase().includes(q) ||
      app.version.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q) ||
      app.lastCheck.toLowerCase().includes(q)
    );
  }

  openAddApplication(): void {
    this.showAdd = true;
  }

  closeAddApplication(): void {
    this.showAdd = false;
    this.resetForm();
  }

  addApplication(): void {
    if (
      !this.form.name.trim() ||
      !this.form.server.trim() ||
      !this.form.version.trim()
    ) {
      return;
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const newApp: ApplicationItem = {
      name: this.form.name.trim(),
      server: this.form.server.trim(),
      version: this.form.version.trim(),
      status: this.form.status,
      lastCheck: `${hh}:${mm}`
    };

    this.applications = [newApp, ...this.applications];
    this.closeAddApplication();
  }

  resetForm(): void {
    this.form = {
      name: '',
      server: '',
      version: '',
      status: 'Running',
      lastCheck: '--:--'
    };
  }

  getStatusClass(status: string): string {
    const value = status.toLowerCase();

    if (value === 'running') return 'running';
    if (value === 'warning') return 'warning';
    if (value === 'stopped') return 'stopped';

    return '';
  }
}