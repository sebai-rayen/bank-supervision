import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  query = '';
  message = '';

  general = {
    language: 'Français',
    theme: 'Sombre',
    timezone: 'Africa/Tunis',
    dateFormat: 'DD/MM/YYYY',
    refreshInterval: 30
  };

  notifications = {
    emailAlerts: true,
    criticalOnly: false,
    dailyReport: true,
    weeklyReport: false,
    smtpHost: 'smtp.bank.local',
    smtpPort: 587,
    senderEmail: 'monitoring@bank.com',
    senderName: 'Supervision bancaire'
  };

  security = {
    twoFactor: true,
    ipRestriction: false,
    maintenanceMode: false,
    auditLogs: true,
    sessionTimeout: 30,
    allowExport: true
  };

  monitoring = {
    cpuWarning: 75,
    cpuCritical: 90,
    ramWarning: 80,
    ramCritical: 95,
    diskWarning: 85,
    diskCritical: 95,
    pingTimeout: 5,
    retryCount: 3,
    logRetentionDays: 30,
    autoRestart: false
  };

  system = {
    environment: 'Production',
    configVersion: 'v1.0.0',
    backupFrequency: 'Quotidienne',
    backupTime: '02:00',
    autoBackup: true
  };

  saveSettings(): void {
    this.message = 'Les paramètres ont été enregistrés avec succès.';
    this.clearMessageLater();
  }

  resetDefaults(): void {
    this.message = 'Les paramètres par défaut ont été restaurés.';
    this.clearMessageLater();
  }

  testEmail(): void {
    this.message = 'Test d’envoi e-mail effectué avec succès.';
    this.clearMessageLater();
  }

  exportConfig(): void {
    this.message = 'Export de la configuration lancé.';
    this.clearMessageLater();
  }

  private clearMessageLater(): void {
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}