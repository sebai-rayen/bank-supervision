import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type AlertSeverity = 'Warning' | 'Critical';
type AlertsTab = 'received' | 'send';

interface IncomingAlert {
  server: string;
  subject: string;
  message: string;
  time: string;
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
export class Alerts {
  activeTab: AlertsTab = 'received';

  incoming: IncomingAlert = {
    server: 'SRV-02',
    subject: 'Critical RAM Alert',
    message: 'High memory usage detected on SRV-02. Immediate verification recommended.',
    time: '10:15'
  };

  alerts: ReceivedAlert[] = [
    {
      id: 1,
      server: 'SRV-01',
      type: 'CPU',
      severity: 'Warning',
      email: 'admin@bank.com',
      time: '09:40',
      read: false,
      isNew: true
    },
    {
      id: 2,
      server: 'SRV-02',
      type: 'RAM',
      severity: 'Critical',
      email: 'ops@bank.com',
      time: '10:15',
      read: false,
      isNew: true
    },
    {
      id: 3,
      server: 'SRV-03',
      type: 'Disk',
      severity: 'Warning',
      email: 'infra@bank.com',
      time: '10:32',
      read: true,
      isNew: false
    },
    {
      id: 4,
      server: 'SRV-04',
      type: 'Network',
      severity: 'Critical',
      email: 'security@bank.com',
      time: '11:05',
      read: false,
      isNew: false
    }
  ];

  serverOptions: string[] = [
    'SRV-01',
    'SRV-02',
    'SRV-03',
    'SRV-04',
    'SRV-05',
    'SRV-06'
  ];

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
  }

  resetIncoming(): void {
    this.incoming = {
      server: '--',
      subject: 'No recent alert',
      message: 'No incoming email alert available.',
      time: '--:--'
    };
  }

  markAllRead(): void {
    this.alerts = this.alerts.map(alert => ({
      ...alert,
      read: true,
      isNew: false
    }));
  }

  clearAll(): void {
    this.alerts = [];
  }

  ack(id: number): void {
    this.alerts = this.alerts.map(alert =>
      alert.id === id
        ? { ...alert, read: true, isNew: false }
        : alert
    );
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
      read: false,
      isNew: true
    };

    this.alerts = [receivedItem, ...this.alerts];

    this.incoming = {
      server: this.sendForm.server,
      subject: this.sendForm.subject.trim(),
      message: this.sendForm.message.trim(),
      time
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
}