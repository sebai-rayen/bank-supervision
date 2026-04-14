import { Component, HostListener,ChangeDetectorRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApplicationApi, ApplicationService } from '../../services/application.service';

type ApplicationStatus = 'En ligne' | 'Alerte' | 'Arrêtée' | 'Maintenance';

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
  server: string;
  version: string;
  status: string;
}

const DEFAULT_LAST_CHECK = '--:--';
const DEFAULT_STATUS = 'Running';
const DEFAULT_ENVIRONNEMENT = 'Production';
const DEFAULT_TECHNOLOGIE = ['-'];
const DEFAULT_DESCRIPTION = 'Application ajoutee par l utilisateur.';

interface CurrentUser {
  fullName: string;
  username: string;
  role: string;
  email: string;
  status: string;
  image: string;
}

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
  private applicationService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  searchTerm = '';
  showProfileCard = false;
  showAdd = false;
  loading = false;
  errorMessage = '';

  currentUser: CurrentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bank.com',
    status: 'Connecté',
    image: 'assets/profil.png'
  };

  applications: ApplicationItem[] = [];

  selectedApplication: ApplicationItem = this.createEmptyApplication();
  form: ApplicationForm = this.createEmptyForm();

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const savedUser =
      JSON.parse(localStorage.getItem('currentUser') || 'null') ||
      JSON.parse(sessionStorage.getItem('currentUser') || 'null');

    if (!savedUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = {
      fullName:
        savedUser.fullName ||
        savedUser.name ||
        savedUser.userName ||
        'Utilisateur',

      username:
        savedUser.username ||
        savedUser.userName ||
        savedUser.name ||
        'user1',

      role:
        savedUser.role ||
        'Utilisateur',

      email:
        savedUser.email ||
        'user@bank.com',

      status:
        savedUser.status ||
        'Connecté',

      image:
        savedUser.image ||
        savedUser.photo ||
        'assets/profil.png'
    };

    this.loadApplications();
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
        console.error('Erreur chargement applications (mine) :', error);
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

  get applicationsFiltrees(): ApplicationItem[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.applications.filter((app) => {
      return (
        !q ||
        app.nom.toLowerCase().includes(q) ||
        app.serveur.toLowerCase().includes(q) ||
        app.version.toLowerCase().includes(q) ||
        app.statut.toLowerCase().includes(q) ||
        app.responsable.toLowerCase().includes(q) ||
        app.environnement.toLowerCase().includes(q)
      );
    });
  }

  get resume(): { label: string; value: number; tone: string }[] {
    return [
      { label: 'Applications', value: this.applications.length, tone: 'blue' },
      { label: 'En ligne', value: this.applications.filter(a => a.statut === 'En ligne').length, tone: 'green' },
      { label: 'Alertes', value: this.applications.filter(a => a.statut === 'Alerte').length, tone: 'yellow' },
      { label: 'Maintenance', value: this.applications.filter(a => a.statut === 'Maintenance').length, tone: 'purple' }
    ];
  }

  get aiSeverityClass(): string {
    const app = this.selectedApplication;

    if (app.statut === 'Arrêtée') return 'danger';
    if (app.statut === 'Alerte' || app.latence >= 220 || app.incidents >= 2) return 'warning';
    if (app.statut === 'Maintenance') return 'info';
    return 'success';
  }

  get aiTitle(): string {
    const app = this.selectedApplication;

    if (app.statut === 'Arrêtée') return 'Intervention immédiate recommandée';
    if (app.statut === 'Alerte') return 'Surveillance renforcée recommandée';
    if (app.statut === 'Maintenance') return 'Suivi de maintenance recommandé';
    return 'Application globalement stable';
  }

  get aiMessage(): string {
    const app = this.selectedApplication;

    if (app.statut === 'Arrêtée') {
      return `L’application ${app.nom} est actuellement arrêtée. Une vérification du service, des dépendances techniques et du dernier déploiement est prioritaire.`;
    }

    if (app.statut === 'Alerte') {
      return `L’application ${app.nom} présente des signes de dégradation. La latence et le nombre d’incidents indiquent un risque de baisse de performance à court terme.`;
    }

    if (app.statut === 'Maintenance') {
      return `L’application ${app.nom} est en maintenance. Il est conseillé de suivre la disponibilité et de valider le bon retour en service après intervention.`;
    }

    if (app.latence > 180 || app.charge > 70) {
      return `L’application ${app.nom} reste disponible, mais certains indicateurs montrent une montée de charge. Une surveillance préventive est recommandée.`;
    }

    return `L’application ${app.nom} fonctionne correctement avec des indicateurs globalement stables.`;
  }

  get aiRecommendations(): string[] {
    const app = this.selectedApplication;
    const recommendations: string[] = [];

    if (app.statut === 'Arrêtée') {
      recommendations.push('Vérifier immédiatement le statut du service applicatif.');
      recommendations.push('Contrôler les journaux système et applicatifs.');
      recommendations.push('Analyser le dernier déploiement et les dépendances réseau.');
    } else if (app.statut === 'Alerte') {
      recommendations.push('Surveiller l’évolution de la latence en temps réel.');
      recommendations.push('Vérifier la charge du serveur associé.');
      recommendations.push('Examiner les incidents récents pour identifier une tendance.');
    } else if (app.statut === 'Maintenance') {
      recommendations.push('Valider le planning de maintenance en cours.');
      recommendations.push('Contrôler les impacts sur les utilisateurs métiers.');
      recommendations.push('Préparer les vérifications post-maintenance.');
    } else {
      recommendations.push('Maintenir une surveillance standard des indicateurs.');
      recommendations.push('Vérifier périodiquement la latence et la disponibilité.');
      recommendations.push('Confirmer la stabilité après chaque déploiement.');
    }

    if (app.incidents >= 2) {
      recommendations.push('Prioriser une analyse détaillée des incidents récurrents.');
    }

    if (app.charge >= 70) {
      recommendations.push('Contrôler la montée de charge et la capacité serveur.');
    }

    return recommendations.slice(0, 4);
  }

  selectApplication(app: ApplicationItem): void {
    this.selectedApplication = app;
  }

  openAddApplication(): void {
    this.showAdd = true;
  }

  closeAddApplication(): void {
    this.showAdd = false;
    this.resetForm();
  }

  addApplication(): void {
    if (!this.isFormValid()) {
      return;
    }

    const payload: ApplicationApi = {
      name: this.form.name.trim(),
      servers: this.form.server.trim(),
      version: this.form.version.trim(),
      status: this.form.status || DEFAULT_STATUS
    };

    this.applicationService.addApplication(payload).subscribe({
      next: (created) => {
        const newItem = this.mapApiToUi(created, payload);
        this.applications = [newItem, ...this.applications];
        this.selectedApplication = newItem;
        this.closeAddApplication();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur ajout application :', error);
        this.errorMessage = 'Impossible d\'ajouter l\'application.';
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
      case 'Arrêtée':
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
    if (event) {
      event.stopPropagation();
    }
    this.showProfileCard = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showProfileCard = false;
  }

  logout(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.showProfileCard = false;

    if (!this.isBrowser) return;

    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private createEmptyForm(): ApplicationForm {
    return {
      name: '',
      server: '',
      version: '',
      status: DEFAULT_STATUS
    };
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
  }

  private isFormValid(): boolean {
    return Boolean(
      this.form.name.trim() &&
      this.form.server.trim() &&
      this.form.version.trim()
    );
  }

  private createEmptyApplication(): ApplicationItem {
    return {
      nom: '',
      serveur: '',
      version: '',
      statut: 'En ligne',
      heure: DEFAULT_LAST_CHECK,
      description: '',
      responsable: '',
      environnement: DEFAULT_ENVIRONNEMENT,
      technologie: [],
      disponibilite: 0,
      latence: 0,
      charge: 0,
      incidents: 0,
      dernierDeploiement: '',
      utilisateurs: ''
    };
  }

  private applyLoadedApplications(data: ApplicationApi[]): void {
    this.applications = data.map((app) => this.mapApiToUi(app));
    this.selectedApplication = this.applications[0] || this.createEmptyApplication();
  }

  private mapApiToUi(api: ApplicationApi, fallback?: ApplicationApi): ApplicationItem {
    const status = this.mapStatusToUser(api.status || fallback?.status || DEFAULT_STATUS);
    return {
      id: api.id,
      nom: api.name || fallback?.name || 'Nouvelle application',
      serveur: api.servers || fallback?.servers || 'N/A',
      version: api.version || fallback?.version || 'v1.0.0',
      statut: status,
      heure: this.formatTime(api.lastCheck),
      description: DEFAULT_DESCRIPTION,
      responsable: this.currentUser.fullName || 'Utilisateur',
      environnement: DEFAULT_ENVIRONNEMENT,
      technologie: DEFAULT_TECHNOLOGIE,
      disponibilite: status === 'En ligne' ? 99 : 70,
      latence: status === 'Alerte' ? 240 : 120,
      charge: 45,
      incidents: status === 'Alerte' ? 1 : 0,
      dernierDeploiement: 'Aujourd hui',
      utilisateurs: '0'
    };
  }

  private mapStatusToUser(status?: string): ApplicationStatus {
    const value = (status || DEFAULT_STATUS).toLowerCase();
    if (value === 'running') return 'En ligne';
    if (value === 'warning') return 'Alerte';
    if (value === 'stopped') return 'Arrêtée';
    if (value === 'maintenance') return 'Maintenance';
    return 'En ligne';
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

