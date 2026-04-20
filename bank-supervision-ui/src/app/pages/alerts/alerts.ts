import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertsService, type AlertSeverity, type AdminAlertsResponse, type IncomingAlertDto, type ReceivedAlertDto } from '../../services/alerts.service';

type AlertsTab = 'received' | 'send';

interface IncomingAlert {
  server: string;
  subject: string;
  message: string;
  time: string;
  severity: AlertSeverity;
}

interface ReceivedAlert {
  id: number;
  server: string;
  type: string;
  severity: AlertSeverity;
  email: string;
  time: string;
  read: boolean;
  isNew: boolean;
  message: string;
}

interface SendForm {
  server: string;
  recipient: string;
  type: string;
  severity: '' | AlertSeverity;
  subject: string;
  message: string;
}

interface SentAlert {
  id: number;
  server: string;
  recipient: string;
  severity: AlertSeverity;
  subject: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.css']
})
export class Alerts implements OnInit, OnDestroy {
  private alertsService = inject(AlertsService);
  private subscription?: Subscription;

  activeTab: AlertsTab = 'received';

  isLoading = false;
  loadError = '';

  incoming: IncomingAlert | null = null;
  alerts: ReceivedAlert[] = [];

  serverOptions: string[] = [];

  userOptions: string[] = [
    'admin@bank.com',
    'ops@bank.com',
    'infra@bank.com',
    'security@bank.com'
  ];

  sendForm: SendForm = this.createEmptyForm();

  formMessage = '';
  formError = false;

  sentAlerts: SentAlert[] = [
    {
      id: 1,
      server: 'SRV-05',
      recipient: 'ops@bank.com',
      severity: 'Warning',
      subject: 'CPU Warning on SRV-05',
      message: 'CPU usage has exceeded the warning threshold.',
      time: '08:50'
    }
  ];

  setTab(tab: AlertsTab): void {
    this.activeTab = tab;
    this.formMessage = '';
    this.formError = false;

    if (tab === 'received') {
      this.refreshAlerts();
    }
  }

  ngOnInit(): void {
    this.refreshAlerts();
    this.subscription = this.alertsService.pollAdminAlerts(7000).subscribe({
      next: (data) => this.applyBackendData(data),
      error: () => {
        // keep showing previous data; surface error on manual refresh only
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  resetIncoming(): void {
    this.refreshAlerts();
  }

  markAllRead(): void {
    const current = this.readIds;
    this.alerts.forEach((a) => current.add(a.id));
    this.readIds = current;
    this.applyReadState();
  }

  clearAll(): void {
    this.alerts = [];
    this.incoming = null;
    this.serverOptions = [];
  }

  ack(id: number): void {
    const current = this.readIds;
    current.add(id);
    this.readIds = current;
    this.applyReadState();
  }

  exportReceivedAlerts(): void {
    const content = JSON.stringify(this.alerts, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'received-alerts.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  resetSendForm(): void {
    this.sendForm = this.createEmptyForm();
    this.formMessage = '';
    this.formError = false;
  }

  sendAlert(): void {
    if (
      !this.sendForm.server ||
      !this.sendForm.recipient ||
      !this.sendForm.type ||
      !this.sendForm.severity ||
      !this.sendForm.subject.trim() ||
      !this.sendForm.message.trim()
    ) {
      this.formError = true;
      this.formMessage = 'Please fill in all fields before sending the alert.';
      return;
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const sentItem: SentAlert = {
      id: Date.now(),
      server: this.sendForm.server,
      recipient: this.sendForm.recipient,
      severity: this.sendForm.severity,
      subject: this.sendForm.subject.trim(),
      message: this.sendForm.message.trim(),
      time
    };

    this.sentAlerts = [sentItem, ...this.sentAlerts];

    const receivedItem: ReceivedAlert = {
      id: Date.now() + 1,
      server: this.sendForm.server,
      type: this.sendForm.type,
      severity: this.sendForm.severity,
      email: this.sendForm.recipient,
      time,
      message: this.sendForm.message.trim(),
      read: false,
      isNew: true
    };

    this.alerts = [receivedItem, ...this.alerts];

    this.incoming = {
      server: this.sendForm.server,
      subject: this.sendForm.subject.trim(),
      message: this.sendForm.message.trim(),
      time
      ,
      severity: this.sendForm.severity
    };

    this.formError = false;
    this.formMessage = 'Alert sent successfully.';
    this.resetSendForm();
    this.formMessage = 'Alert sent successfully.';
  }

  trackById(_: number, item: ReceivedAlert): number {
    return item.id;
  }

  trackBySentId(_: number, item: SentAlert): number {
    return item.id;
  }

  private createEmptyForm(): SendForm {
    return {
      server: '',
      recipient: '',
      type: '',
      severity: '',
      subject: '',
      message: ''
    };
  }

  private refreshAlerts(): void {
    this.isLoading = true;
    this.loadError = '';

    this.alertsService.getAdminAlerts().subscribe({
      next: (data) => this.applyBackendData(data),
      error: () => {
        this.loadError = 'Failed to load alerts from backend.';
        this.isLoading = false;
      }
    });
  }

  private applyBackendData(data: AdminAlertsResponse): void {
    const received = (data.alerts ?? []).map((a: ReceivedAlertDto) => ({
      id: a.id,
      server: a.server,
      type: a.type,
      severity: a.severity,
      email: a.email,
      time: a.time,
      message: a.message,
      read: false,
      isNew: false
    }));

    this.alerts = received;

    this.incoming = data.latest
      ? this.mapIncoming(data.latest)
      : null;

    this.serverOptions = Array.from(new Set(received.map((a) => a.server))).sort();

    this.applyReadState();

    this.isLoading = false;
  }

  private mapIncoming(latest: IncomingAlertDto): IncomingAlert {
    return {
      server: latest.server,
      subject: latest.subject,
      message: latest.message,
      time: latest.time,
      severity: latest.severity
    };
  }

  private applyReadState(): void {
    const read = this.readIds;
    this.alerts = this.alerts.map((a) => {
      const isRead = read.has(a.id);
      return {
        ...a,
        read: isRead,
        isNew: !isRead
      };
    });
  }

  private get readIds(): Set<number> {
    try {
      const raw = localStorage.getItem('adminAlerts.readIds');
      const parsed = raw ? (JSON.parse(raw) as number[]) : [];
      return new Set(parsed.filter((v) => typeof v === 'number'));
    } catch {
      return new Set();
    }
  }

  private set readIds(value: Set<number>) {
    localStorage.setItem('adminAlerts.readIds', JSON.stringify(Array.from(value)));
  }
}
