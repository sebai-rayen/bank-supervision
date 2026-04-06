import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type Severity = 'Warning' | 'Critical';

interface UserAlert {
  id: number;
  server: string;
  recipientName: string;
  recipientEmail: string;
  type: string;
  severity: Severity;
  subject: string;
  message: string;
  time: string;
  read: boolean;
  sentBy: string;
  createdAt: number;
}

@Component({
  selector: 'app-alert-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './alert-user.html',
  styleUrls: ['./alert-user.css']
})
export class AlertUser implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  currentUserName = 'Utilisateur';
  currentUserEmail = 'user@bank.com';
  query = '';

  allAlerts: UserAlert[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const currentUser =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserName = currentUser.name || 'Utilisateur';
    this.currentUserEmail = currentUser.email || 'user@bank.com';

    this.loadAlerts();
  }

  private loadAlerts(): void {
    this.allAlerts = JSON.parse(localStorage.getItem('userAlerts') || '[]')
      .sort((a: UserAlert, b: UserAlert) => b.createdAt - a.createdAt);
  }

  private persistAlerts(): void {
    localStorage.setItem('userAlerts', JSON.stringify(this.allAlerts));
  }

  get myAlerts(): UserAlert[] {
    return this.allAlerts.filter(
      (item) => item.recipientEmail.toLowerCase() === this.currentUserEmail.toLowerCase()
    );
  }

  get filteredAlerts(): UserAlert[] {
    const q = this.query.trim().toLowerCase();

    return this.myAlerts.filter((item) => {
      return (
        !q ||
        item.server.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.severity.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }

  get latestAlert(): UserAlert | null {
    return this.filteredAlerts.length ? this.filteredAlerts[0] : null;
  }

  get summary() {
    return [
      { label: 'Mes alertes', value: this.myAlerts.length, tone: 'blue' },
      { label: 'Non lues', value: this.myAlerts.filter((a) => !a.read).length, tone: 'yellow' },
      { label: 'Critical', value: this.myAlerts.filter((a) => a.severity === 'Critical').length, tone: 'red' },
      { label: 'Warning', value: this.myAlerts.filter((a) => a.severity === 'Warning').length, tone: 'green' }
    ];
  }

  severityClass(value: string): string {
    return value.toLowerCase();
  }

  markRead(item: UserAlert): void {
    const target = this.allAlerts.find((a) => a.id === item.id);
    if (target) {
      target.read = true;
      this.persistAlerts();
      this.loadAlerts();
    }
  }

  markAllRead(): void {
    this.allAlerts = this.allAlerts.map((item) =>
      item.recipientEmail.toLowerCase() === this.currentUserEmail.toLowerCase()
        ? { ...item, read: true }
        : item
    );

    this.persistAlerts();
    this.loadAlerts();
  }

  exportAlerts(): void {
    if (!this.isBrowser || !this.filteredAlerts.length) return;

    const rows = [
      ['Server', 'Type', 'Severity', 'Subject', 'Message', 'Time', 'Read'],
      ...this.filteredAlerts.map((a) => [
        a.server,
        a.type,
        a.severity,
        a.subject,
        a.message,
        a.time,
        a.read ? 'Yes' : 'No'
      ])
    ];

    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'user-alerts.csv';
    link.click();

    window.URL.revokeObjectURL(url);
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}