import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApplicationApi, ApplicationService } from '../../services/application.service';
import { ServerApi, ServerService } from '../../services/server.service';

type ApplicationStatus = 'En ligne' | 'Alerte' | 'Arretee' | 'Maintenance';

interface ApplicationItem {
  id?: number;
  nom: string;
  serveur: string;
  version: string;
  statut: ApplicationStatus;
  heure: string;
  description: string;
  responsable: string;
  environnement: string;
  technologie: string[];
  disponibilite: number;
  latence: number;
  charge: number;
  incidents: number;
  dernierDeploiement: string;
  utilisateurs: string;
}

interface ApplicationForm {
  name: string;
  serverId: number | null;
  version: string;
  status: string;
}

interface ServerOption {
  id: number;
  name: string;
}

interface CurrentUser {
  fullName: string;
  username: string;
  role: string;
  email: string;
  status: string;
  image: string;
}

const DEFAULT_LAST_CHECK = '--:--';
const DEFAULT_STATUS = 'Running';
const DEFAULT_ENVIRONMENT = 'Production';
const DEFAULT_TECHNOLOGIES = ['-'];
const DEFAULT_DESCRIPTION = 'Application ajoutee par le compte utilisateur.';

@Component({
  selector: 'app-application-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './application-users.html',
  styleUrls: ['./application-users.css']
})
export class ApplicationUsers implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private applicationService = inject(ApplicationService);
  private serverService = inject(ServerService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 6;
  showProfileCard = false;
  showAdd = false;
  loading = false;
  errorMessage = '';
  serversLoading = false;
  serverOptions: ServerOption[] = [];

  currentUser: CurrentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bank.com',
    status: 'Connecte',
    image: 'assets/profil.png'
  };

  applications: ApplicationItem[] = [];
  selectedApplication: ApplicationItem = this.createEmptyApplication();
  form: ApplicationForm = this.createEmptyForm();

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    if (!this.restoreUserFromStorage()) {
      return;
    }

    this.loadApplications();
    this.loadServers();
  }

  get applicationsFiltrees(): ApplicationItem[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.applications.filter((app) => {
      return (
        !query ||
        app.nom.toLowerCase().includes(query) ||
        app.serveur.toLowerCase().includes(query) ||
        app.version.toLowerCase().includes(query) ||
        app.statut.toLowerCase().includes(query) ||
        app.responsable.toLowerCase().includes(query) ||
        app.environnement.toLowerCase().includes(query)
      );
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.applicationsFiltrees.length / this.itemsPerPage));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginatedApplications(): ApplicationItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.applicationsFiltrees.slice(start, start + this.itemsPerPage);
  }

  get resume(): { label: string; value: number; tone: string }[] {
    return [
      { label: 'Applications', value: this.applications.length, tone: 'blue' },
      {
        label: 'En ligne',
        value: this.applications.filter((app) => app.statut === 'En ligne').length,
        tone: 'green'
      },
      {
        label: 'Alertes',
        value: this.applications.filter((app) => app.statut === 'Alerte').length,
        tone: 'yellow'
      },
      {
        label: 'Maintenance',
        value: this.applications.filter((app) => app.statut === 'Maintenance').length,
        tone: 'purple'
      }
    ];
  }

  get aiSeverityClass(): string {
    if (this.selectedApplication.statut === 'Arretee') {
      return 'danger';
    }

    if (this.selectedApplication.statut === 'Alerte' || this.selectedApplication.latence >= 220 || this.selectedApplication.incidents >= 2) {
      return 'warning';
    }

    if (this.selectedApplication.statut === 'Maintenance') {
      return 'info';
    }

    return 'success';
  }

  get aiTitle(): string {
    if (this.selectedApplication.statut === 'Arretee') {
      return 'Intervention immediate recommandee';
    }

    if (this.selectedApplication.statut === 'Alerte') {
      return 'Surveillance renforcee recommandee';
    }

    if (this.selectedApplication.statut === 'Maintenance') {
      return 'Suivi de maintenance recommande';
    }

    return 'Application globalement stable';
  }

  get aiMessage(): string {
    const app = this.selectedApplication;

    if (app.statut === 'Arretee') {
      return `L'application ${app.nom} est actuellement arretee. Une verification du service, des dependances techniques et du dernier deploiement est prioritaire.`;
    }

    if (app.statut === 'Alerte') {
      return `L'application ${app.nom} presente des signes de degradation. La latence et le nombre d'incidents indiquent un risque de baisse de performance a court terme.`;
    }

    if (app.statut === 'Maintenance') {
      return `L'application ${app.nom} est en maintenance. Il est conseille de suivre la disponibilite et de valider le bon retour en service apres intervention.`;
    }

    if (app.latence > 180 || app.charge > 70) {
      return `L'application ${app.nom} reste disponible, mais certains indicateurs montrent une montee de charge. Une surveillance preventive est recommandee.`;
    }

    return `L'application ${app.nom} fonctionne correctement avec des indicateurs globalement stables.`;
  }

  get aiRecommendations(): string[] {
    const app = this.selectedApplication;
    const recommendations: string[] = [];

    if (app.statut === 'Arretee') {
      recommendations.push('Verifier immediatement le statut du service applicatif.');
      recommendations.push('Controler les journaux systeme et applicatifs.');
      recommendations.push('Analyser le dernier deploiement et les dependances reseau.');
    } else if (app.statut === 'Alerte') {
      recommendations.push("Surveiller l'evolution de la latence en temps reel.");
      recommendations.push('Verifier la charge du serveur associe.');
      recommendations.push('Examiner les incidents recents pour identifier une tendance.');
    } else if (app.statut === 'Maintenance') {
      recommendations.push('Valider le planning de maintenance en cours.');
      recommendations.push('Controler les impacts sur les utilisateurs metiers.');
      recommendations.push('Preparer les verifications post-maintenance.');
    } else {
      recommendations.push('Maintenir une surveillance standard des indicateurs.');
      recommendations.push('Verifier periodiquement la latence et la disponibilite.');
      recommendations.push('Confirmer la stabilite apres chaque deploiement.');
    }

    if (app.incidents >= 2) {
      recommendations.push('Prioriser une analyse detaillee des incidents recurrents.');
    }

    if (app.charge >= 70) {
      recommendations.push('Controler la montee de charge et la capacite serveur.');
    }

    return recommendations.slice(0, 4);
  }

  loadServers(): void {
    this.serversLoading = true;

    this.serverService.getServers().subscribe({
      next: (data: ServerApi[]) => {
        this.serverOptions = data
          .filter((server) => server.id !== undefined && server.id !== null && Boolean(server.name?.trim()))
          .map((server) => ({ id: server.id as number, name: server.name!.trim() }))
          .sort((a, b) => a.name.localeCompare(b.name));
        this.serversLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur chargement serveurs :', error);
        this.serverOptions = [];
        this.serversLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.applicationService.getMyApplications().subscribe({
      next: (data) => {
        this.applyLoadedApplications(data);
        this.finishLoading();
      },
      error: (error) => {
        console.error('Erreur chargement applications utilisateur :', error);
        this.applicationService.getApplications().subscribe({
          next: (data) => {
            this.applyLoadedApplications(data);
            this.finishLoading();
          },
          error: (fallbackError) => {
            console.error('Erreur chargement applications :', fallbackError);
            this.errorMessage = 'Impossible de charger les applications.';
            this.applications = [];
            this.selectedApplication = this.createEmptyApplication();
            this.finishLoading();
          }
        });
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  selectApplication(app: ApplicationItem): void {
    this.selectedApplication = app;
  }

  openAddApplication(): void {
    this.showAdd = true;
    this.errorMessage = '';

    if (!this.serversLoading && this.serverOptions.length === 0) {
      this.loadServers();
    }
  }

  closeAddApplication(): void {
    this.showAdd = false;
    this.resetForm();
  }

  addApplication(): void {
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Remplissez tous les champs obligatoires.';
      return;
    }

    const selectedServer = this.serverOptions.find((server) => server.id === this.form.serverId);
    if (!selectedServer) {
      this.errorMessage = 'Veuillez selectionner un serveur.';
      return;
    }

    const payload: ApplicationApi = {
      name: this.form.name.trim(),
      serverId: selectedServer.id,
      servers: selectedServer.name,
      version: this.form.version.trim(),
      status: this.form.status || DEFAULT_STATUS
    };

    this.applicationService.addApplication(payload).subscribe({
      next: (created) => {
        const newItem = this.mapApiToUi(created, payload);
        this.applications = [newItem, ...this.applications];
        this.selectedApplication = newItem;
        this.currentPage = 1;
        this.closeAddApplication();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur ajout application :', error);
        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          "Impossible d'ajouter l'application.";
        this.cdr.detectChanges();
      }
    });
  }

  statusClass(status: ApplicationStatus): string {
    switch (status) {
      case 'En ligne':
        return 'en-ligne';
      case 'Alerte':
        return 'alerte';
      case 'Arretee':
        return 'arretee';
      default:
        return 'maintenance';
    }
  }

  toggleProfileCard(event: MouseEvent): void {
    event.stopPropagation();
    this.showProfileCard = !this.showProfileCard;
  }

  closeProfileCard(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showProfileCard = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileCard = false;
  }

  logout(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showProfileCard = false;

    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private restoreUserFromStorage(): boolean {
    const savedUser = this.readCurrentUserFromStorage();

    if (!savedUser) {
      this.router.navigate(['/login']);
      return false;
    }

    this.currentUser = {
      fullName: savedUser.fullName || savedUser.name || savedUser.userName || savedUser.username || 'Utilisateur',
      username: savedUser.username || savedUser.userName || savedUser.name || 'user1',
      role: savedUser.role || 'Utilisateur',
      email: savedUser.email || 'user@bank.com',
      status: savedUser.status || 'Connecte',
      image: savedUser.image || savedUser.photo || 'assets/profil.png'
    };

    return true;
  }

  private readCurrentUserFromStorage(): any | null {
    try {
      const fromLocal = localStorage.getItem('currentUser');
      const fromSession = sessionStorage.getItem('currentUser');
      return JSON.parse(fromLocal || 'null') || JSON.parse(fromSession || 'null');
    } catch {
      return null;
    }
  }

  private createEmptyForm(): ApplicationForm {
    return {
      name: '',
      serverId: null,
      version: '',
      status: DEFAULT_STATUS
    };
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
  }

  private isFormValid(): boolean {
    return Boolean(this.form.name.trim() && this.form.serverId !== null && this.form.version.trim());
  }

  private createEmptyApplication(): ApplicationItem {
    return {
      nom: '-',
      serveur: '-',
      version: '-',
      statut: 'En ligne',
      heure: DEFAULT_LAST_CHECK,
      description: '-',
      responsable: '-',
      environnement: DEFAULT_ENVIRONMENT,
      technologie: [],
      disponibilite: 0,
      latence: 0,
      charge: 0,
      incidents: 0,
      dernierDeploiement: '-',
      utilisateurs: '0'
    };
  }

  private applyLoadedApplications(data: ApplicationApi[]): void {
    this.applications = data.map((app) => this.mapApiToUi(app));
    this.currentPage = 1;
    this.selectedApplication = this.applications[0] || this.createEmptyApplication();
  }

  private mapApiToUi(api: ApplicationApi, fallback?: ApplicationApi): ApplicationItem {
    const normalizedStatus = this.mapStatusToUser(api.status || fallback?.status || DEFAULT_STATUS);
    const isAlert = normalizedStatus === 'Alerte';
    const isStopped = normalizedStatus === 'Arretee';

    return {
      id: api.id,
      nom: api.name || fallback?.name || 'Nouvelle application',
      serveur: api.servers || fallback?.servers || 'N/A',
      version: api.version || fallback?.version || 'v1.0.0',
      statut: normalizedStatus,
      heure: this.formatTime(api.lastCheck),
      description: DEFAULT_DESCRIPTION,
      responsable: this.currentUser.fullName || 'Utilisateur',
      environnement: DEFAULT_ENVIRONMENT,
      technologie: DEFAULT_TECHNOLOGIES,
      disponibilite: isStopped ? 0 : isAlert ? 92 : 99,
      latence: isStopped ? 0 : isAlert ? 240 : 120,
      charge: isStopped ? 0 : isAlert ? 74 : 45,
      incidents: isAlert ? 2 : isStopped ? 3 : 0,
      dernierDeploiement: 'Aujourd hui',
      utilisateurs: isStopped ? '0' : '24'
    };
  }

  private mapStatusToUser(status?: string): ApplicationStatus {
    const value = (status || DEFAULT_STATUS).toLowerCase();

    if (value.includes('warn') || value.includes('alert')) {
      return 'Alerte';
    }

    if (value.includes('stop') || value.includes('down') || value.includes('off')) {
      return 'Arretee';
    }

    if (value.includes('maint')) {
      return 'Maintenance';
    }

    return 'En ligne';
  }

  private formatTime(value?: string): string {
    if (!value) {
      return DEFAULT_LAST_CHECK;
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return DEFAULT_LAST_CHECK;
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
