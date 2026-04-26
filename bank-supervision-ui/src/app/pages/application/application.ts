import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApplicationService, ApplicationApi, UserOption } from '../../services/application.service';
import { ServerService, ServerApi } from '../../services/server.service';

interface ApplicationItem {
  id?: number;
  name: string;
  server: string;
  user: string;
  version: string;
  status: string;
  lastCheck: string;
}

interface ApplicationForm {
  name: string;
  serverId: number | null;
  assignedUserId: number | null;
  version: string;
  status: string;
}

interface ServerOption {
  id: number;
  name: string;
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
  private serverService = inject(ServerService);
  private cdr = inject(ChangeDetectorRef);

  query = '';
  showAdd = false;
  loading = false;
  errorMessage = '';

  serversLoading = false;
  serversError = '';
  serverOptions: ServerOption[] = [];

  usersLoading = false;
  usersError = '';
  userOptions: UserOption[] = [];

  currentPage = 1;
  itemsPerPage = 6;

  applications: ApplicationItem[] = [];

  form: ApplicationForm = this.createEmptyForm();

  ngOnInit(): void {
    this.loadApplications();
    this.loadServers();
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
      user: app.userName ?? '-',
      version: app.version ?? '-',
      status: app.status ?? DEFAULT_STATUS,
      lastCheck: this.formatTime(app.lastCheck)
    };
  }

  loadServers(): void {
    this.serversLoading = true;
    this.serversError = '';

    this.serverService.getServers().subscribe({
      next: (data: ServerApi[]) => {
        this.serverOptions = data
          .filter((s) => s.id !== undefined && s.id !== null && Boolean(s.name?.trim()))
          .map((s) => ({ id: s.id as number, name: (s.name as string).trim() }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.serversLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement serveurs (liste) :', error);
        this.serversError = 'Impossible de charger la liste des serveurs.';
        this.serverOptions = [];
        this.serversLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAssignableUsers(): void {
    this.usersLoading = true;
    this.usersError = '';

    this.applicationService.getAssignableUsers().subscribe({
      next: (data) => {
        this.userOptions = data;
        this.usersLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement utilisateurs (assignables) :', error);
        this.usersError = 'Impossible de charger les utilisateurs.';
        this.usersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredApplications(): ApplicationItem[] {
    const q = this.query.trim().toLowerCase();

    if (!q) {
      return this.applications;
    }

    return this.applications.filter(app =>
      app.name.toLowerCase().includes(q) ||
      app.server.toLowerCase().includes(q) ||
      app.user.toLowerCase().includes(q) ||
      app.version.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q) ||
      app.lastCheck.toLowerCase().includes(q)
    );
  }

  get totalPages(): number {
    const total = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
    return total > 0 ? total : 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedApplications(): ApplicationItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredApplications.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openAddApplication(): void {
    this.showAdd = true;
    this.errorMessage = '';

    if (!this.serversLoading && this.serverOptions.length === 0) {
      this.loadServers();
    }
    if (!this.usersLoading && this.userOptions.length === 0) {
      this.loadAssignableUsers();
    }
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

    const selectedServer = this.serverOptions.find((s) => s.id === this.form.serverId);
    if (!selectedServer) {
      this.errorMessage = 'Veuillez sélectionner un serveur.';
      return;
    }

    const payload: ApplicationApi = {
      name: this.form.name.trim(),
      serverId: selectedServer.id,
      servers: selectedServer.name,
      version: this.form.version.trim(),
      status: this.form.status || DEFAULT_STATUS,
      assignedUserId: this.form.assignedUserId ?? undefined
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

  private createEmptyForm(): ApplicationForm {
    return {
      name: '',
      serverId: null,
      assignedUserId: null,
      version: '',
      status: DEFAULT_STATUS
    };
  }

  private isFormValid(): boolean {
    return Boolean(
      this.form.name.trim() &&
      this.form.serverId !== null &&
      this.form.assignedUserId !== null &&
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
