import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertsService, type UserAlertDto } from '../../services/alerts.service';

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
export class AlertUser implements OnInit, OnDestroy {
  private static readonly REFRESH_MS = 15000;
  private platformId = inject(PLATFORM_ID);
  private alertsService = inject(AlertsService);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser = isPlatformBrowser(this.platformId);
  private refreshSubscription?: Subscription;

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
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  private loadAlerts(): void {
    this.alertsService.getMyAlerts().subscribe({
      next: (alerts: UserAlertDto[]) => {
        const readIds = this.readIds;
        this.allAlerts = alerts
          .map((item) => ({
            id: item.id,
            server: item.server,
            recipientName: item.recipientName,
            recipientEmail: item.recipientEmail,
            type: item.type,
            severity: item.severity,
            subject: item.subject,
            message: item.message,
            time: item.time,
            read: readIds.has(item.id),
            sentBy: item.sentBy,
            createdAt: item.createdAt ?? 0
          }))
          .sort((a: UserAlert, b: UserAlert) => b.createdAt - a.createdAt);
        this.cdr.detectChanges();
      },
      error: () => {
        this.allAlerts = [];
        this.cdr.detectChanges();
      }
    });
  }

  private startPolling(): void {
    this.refreshSubscription = this.alertsService.pollMyAlerts(AlertUser.REFRESH_MS).subscribe({
      next: (alerts: UserAlertDto[]) => {
        const readIds = this.readIds;
        this.allAlerts = alerts
          .map((item) => ({
            id: item.id,
            server: item.server,
            recipientName: item.recipientName,
            recipientEmail: item.recipientEmail,
            type: item.type,
            severity: item.severity,
            subject: item.subject,
            message: item.message,
            time: item.time,
            read: readIds.has(item.id),
            sentBy: item.sentBy,
            createdAt: item.createdAt ?? 0
          }))
          .sort((a: UserAlert, b: UserAlert) => b.createdAt - a.createdAt);
        this.cdr.detectChanges();
      },
      error: () => {
        // keep showing the current list if background refresh fails
      }
    });
  }

  get myAlerts(): UserAlert[] {
    return this.allAlerts;
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
    const current = this.readIds;
    current.add(item.id);
    this.readIds = current;
    this.allAlerts = this.allAlerts.map((alert) =>
      alert.id === item.id ? { ...alert, read: true } : alert
    );
  }

  markAllRead(): void {
    const current = this.readIds;
    this.allAlerts.forEach((item) => current.add(item.id));
    this.readIds = current;
    this.allAlerts = this.allAlerts.map((item) => ({ ...item, read: true }));
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

  private get readIdsStorageKey(): string {
    return `userAlerts.readIds.${this.currentUserEmail.toLowerCase()}`;
  }

  private get readIds(): Set<number> {
    if (!this.isBrowser) {
      return new Set();
    }

    try {
      const raw = localStorage.getItem(this.readIdsStorageKey);
      const parsed = raw ? (JSON.parse(raw) as number[]) : [];
      return new Set(parsed.filter((value) => typeof value === 'number'));
    } catch {
      return new Set();
    }
  }

  private set readIds(value: Set<number>) {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.readIdsStorageKey, JSON.stringify(Array.from(value)));
  }
}
