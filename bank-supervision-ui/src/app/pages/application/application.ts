import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApplicationService, ApplicationApi } from '../../services/application.service';

interface ApplicationItem {
  id?: number;
  name: string;
  server: string;
  version: string;
  status: string;
  lastCheck: string;
}

const DEFAULT_LAST_CHECK = '--:--';
const DEFAULT_STATUS = 'Running';

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './application.html',
  styleUrls: ['./application.css']
})
export class Application implements OnInit {
  private applicationService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  query = '';
  showAdd = false;
  loading = false;
  errorMessage = '';

  applications: ApplicationItem[] = [];

  form: ApplicationItem = this.createEmptyForm();

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.applicationService.getApplications().subscribe({
      next: (data) => {
        this.applications = data.map(app => this.mapApiToUi(app));
        this.finishLoading();
      },
      error: (error) => {
        console.error('Erreur chargement applications :', error);
        this.errorMessage = 'Impossible de charger les applications.';
        this.finishLoading();
      }
    });
  }

  mapApiToUi(app: ApplicationApi): ApplicationItem {
    return {
      id: app.id,
      name: app.name ?? '-',
      server: app.servers ?? '-',
      version: app.version ?? '-',
      status: app.status ?? DEFAULT_STATUS,
      lastCheck: this.formatTime(app.lastCheck)
    };
  }

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
    this.errorMessage = '';
  }

  closeAddApplication(): void {
    this.showAdd = false;
    this.resetForm();
  }

  addApplication(): void {
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Remplis tous les champs.';
      return;
    }

    const payload: ApplicationApi = {
      name: this.form.name.trim(),
      servers: this.form.server.trim(),
      version: this.form.version.trim(),
      status: this.form.status || DEFAULT_STATUS
    };

    this.applicationService.addApplication(payload).subscribe({
      next: () => {
        this.loadApplications();
        this.query = '';
        this.closeAddApplication();
      },
      error: (error) => {
        console.error('Erreur ajout application :', error);
        this.errorMessage = 'Impossible d\'ajouter l\'application.';
      }
    });
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
  }

  getStatusClass(status: string): string {
    const value = status.toLowerCase();

    if (value === 'running') return 'running';
    if (value === 'warning') return 'warning';
    if (value === 'stopped') return 'stopped';

    return '';
  }

  private createEmptyForm(): ApplicationItem {
    return {
      name: '',
      server: '',
      version: '',
      status: DEFAULT_STATUS,
      lastCheck: DEFAULT_LAST_CHECK
    };
  }

  private isFormValid(): boolean {
    return Boolean(
      this.form.name.trim() &&
      this.form.server.trim() &&
      this.form.version.trim()
    );
  }

  private formatTime(value?: string): string {
    if (!value) return DEFAULT_LAST_CHECK;

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return DEFAULT_LAST_CHECK;
    }

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
