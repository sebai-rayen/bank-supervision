import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { AlertsService, type AlertSeverity, type AdminAlertsResponse, type IncomingAlertDto, type ReceivedAlertDto, type UserAlertDto } from '../../services/alerts.service';
import { UsersService, type PersonneResponse } from '../../services/users.service';
import { ServerService, type ServerApi } from '../../services/server.service';

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
  subject: string;
  time: string;
  read: boolean;
  isNew: boolean;
  message: string;
}

interface SendForm {
  server: string;
  recipients: string[];
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
  private static readonly REFRESH_MS = 15000;
  private alertsService = inject(AlertsService);
  private usersService = inject(UsersService);
  private serverService = inject(ServerService);
  private cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  activeTab: AlertsTab = 'received';

  isLoading = false;
  loadError = '';

  incoming: IncomingAlert | null = null;
  alerts: ReceivedAlert[] = [];

  serverOptions: string[] = [];

  userOptions: string[] = [];

  sendForm: SendForm = this.createEmptyForm();

  formMessage = '';
  formMessageTitle = '';
  formError = false;
  isSending = false;

  sentAlerts: SentAlert[] = [];

  setTab(tab: AlertsTab): void {
    this.activeTab = tab;
    this.clearFormFeedback();

    if (tab === 'received') {
      this.refreshAlerts();
    }
  }

  ngOnInit(): void {
    this.refreshAlerts();
    this.loadUserOptions();
    this.loadServerOptions();
    this.subscription = this.alertsService.pollAdminAlerts(Alerts.REFRESH_MS).subscribe({
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
    this.clearFormFeedback();
  }

  sendAlert(): void {
    if (
      !this.sendForm.server ||
      this.sendForm.recipients.length === 0 ||
      !this.sendForm.type ||
      !this.sendForm.severity ||
      !this.sendForm.subject.trim() ||
      !this.sendForm.message.trim()
    ) {
      this.showErrorMessage(
        'Validation error',
        'Please fill in all required fields and add at least one recipient.'
      );
      return;
    }

    this.isSending = true;
    this.clearFormFeedback();

    const requests = this.sendForm.recipients.map(email => 
      this.alertsService.createAlert({
        server: this.sendForm.server.trim(),
        recipientEmail: email,
        type: this.sendForm.type.trim(),
        severity: this.sendForm.severity as AlertSeverity,
        subject: this.sendForm.subject.trim(),
        message: this.sendForm.message.trim()
      })
    );

    forkJoin(requests).subscribe({
      next: (createdArray) => {
        const sentItems = createdArray.map(created => this.mapSentAlert(created));
        // Add all newly created alerts to the beginning of the history
        this.sentAlerts = [...sentItems, ...this.sentAlerts];
        this.resetSendForm();
        this.showSuccessMessage(
          'Alert(s) sent',
          `Successfully sent alerts to ${createdArray.length} recipient(s).`
        );
        this.refreshAlerts();
        this.cdr.detectChanges();
      },
      error: (error) => {
        const message =
          error?.error?.message ||
          error?.message ||
          'Unable to send some alerts.';
        this.showErrorMessage('Send failed', message);
        this.isSending = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSending = false;
      }
    });
  }

  get availableUserOptions(): string[] {
    return this.userOptions.filter(u => !this.sendForm.recipients.includes(u));
  }

  addRecipientFromSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const email = selectElement.value;
    if (email) {
      if (!this.sendForm.recipients.includes(email)) {
        this.sendForm.recipients.push(email);
      }
      selectElement.value = ''; // Reset the dropdown
      this.clearFormFeedback();
    }
  }

  removeRecipient(email: string): void {
    this.sendForm.recipients = this.sendForm.recipients.filter(r => r !== email);
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
      recipients: [],
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
    const sentAlerts = (data.sentAlerts ?? []).map((item) => this.mapSentAlert(item));

    const sentAsReceived: ReceivedAlert[] = (data.sentAlerts ?? []).map((item: UserAlertDto) => ({
      id: item.id,
      server: item.server,
      type: item.type,
      severity: item.severity,
      email: item.recipientEmail,
      subject: item.subject,
      time: item.time,
      message: item.message,
      read: false,
      isNew: false
    }));

    const backendReceived = (data.alerts ?? []).map((a: ReceivedAlertDto) => ({
      id: a.id,
      server: a.server,
      type: a.type,
      severity: a.severity,
      email: a.email,
      subject: a.subject,
      time: a.time,
      message: a.message,
      read: false,
      isNew: false
    }));

    const mergedRecentAlerts = [...sentAsReceived];

    for (const item of backendReceived) {
      if (!mergedRecentAlerts.some((existing) => existing.id === item.id)) {
        mergedRecentAlerts.push(item);
      }
    }

    this.alerts = mergedRecentAlerts.sort((a, b) => b.id - a.id);

    this.incoming = data.latest
      ? this.mapIncoming(data.latest)
      : null;

    this.serverOptions = Array.from(new Set([
      ...this.serverOptions,
      ...mergedRecentAlerts.map((a) => a.server)
    ])).sort();
    this.sentAlerts = sentAlerts;

    this.applyReadState();

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private loadUserOptions(): void {
    this.usersService.list().subscribe({
      next: (users: PersonneResponse[]) => {
        this.userOptions = users
          .map((user) => user.email)
          .filter((email, index, array) => !!email && array.indexOf(email) === index)
          .sort((a, b) => a.localeCompare(b));
      },
      error: () => {
        // keep fallback suggestions if users endpoint is unavailable
      }
    });
  }

  private loadServerOptions(): void {
    this.serverService.getServers().subscribe({
      next: (servers: ServerApi[]) => {
        const serverNames = servers
          .map((server) => server.name?.trim())
          .filter((name): name is string => !!name)
          .sort((a, b) => a.localeCompare(b));

        if (serverNames.length) {
          this.serverOptions = Array.from(new Set(serverNames));
        }
      },
      error: () => {
        // keep server options inferred from alert data if servers endpoint is unavailable
      }
    });
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

  private mapSentAlert(item: UserAlertDto): SentAlert {
    return {
      id: item.id,
      server: item.server,
      recipient: item.recipientEmail,
      severity: item.severity,
      subject: item.subject,
      message: item.message,
      time: item.time
    };
  }

  private clearFormFeedback(): void {
    this.formMessage = '';
    this.formMessageTitle = '';
    this.formError = false;
  }

  private showSuccessMessage(title: string, message: string): void {
    this.formMessageTitle = title;
    this.formMessage = message;
    this.formError = false;
  }

  private showErrorMessage(title: string, message: string): void {
    this.formMessageTitle = title;
    this.formMessage = message;
    this.formError = true;
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
