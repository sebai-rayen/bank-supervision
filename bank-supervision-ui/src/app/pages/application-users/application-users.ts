import { Component, HostListener, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type ApplicationStatus = 'En ligne' | 'Alerte' | 'Arrêtée' | 'Maintenance';

interface ApplicationItem {
  id: number;
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

  searchTerm = '';
  showProfileCard = false;

  currentUser: CurrentUser = {
    fullName: 'Utilisateur',
    username: 'user1',
    role: 'Utilisateur',
    email: 'user@bank.com',
    status: 'Connecté',
    image: 'assets/profil.png'
  };

  applications: ApplicationItem[] = [
    {
      id: 1,
      nom: 'Core Banking',
      serveur: 'SRV-01',
      version: 'v3.2.1',
      statut: 'En ligne',
      heure: '09:20',
      description: 'Application centrale de gestion bancaire et des opérations internes.',
      responsable: 'Équipe Banque Digitale',
      environnement: 'Production',
      technologie: ['Angular', 'Spring Boot', 'Oracle'],
      disponibilite: 99,
      latence: 120,
      charge: 42,
      incidents: 0,
      dernierDeploiement: '12/03/2026',
      utilisateurs: '1 280'
    },
    {
      id: 2,
      nom: 'API Mobile Banking',
      serveur: 'SRV-02',
      version: 'v2.8.4',
      statut: 'Alerte',
      heure: '09:45',
      description: 'API sécurisée utilisée par les applications mobiles bancaires.',
      responsable: 'Équipe API',
      environnement: 'Production',
      technologie: ['Node.js', 'Express', 'MongoDB'],
      disponibilite: 94,
      latence: 240,
      charge: 71,
      incidents: 2,
      dernierDeploiement: '10/03/2026',
      utilisateurs: '8 430'
    },
    {
      id: 3,
      nom: 'Internet Banking',
      serveur: 'SRV-03',
      version: 'v5.1.0',
      statut: 'En ligne',
      heure: '10:05',
      description: 'Portail web destiné aux clients pour la consultation et la gestion des comptes.',
      responsable: 'Équipe Web Banking',
      environnement: 'Production',
      technologie: ['Angular', '.NET', 'SQL Server'],
      disponibilite: 98,
      latence: 135,
      charge: 55,
      incidents: 1,
      dernierDeploiement: '08/03/2026',
      utilisateurs: '12 600'
    },
    {
      id: 4,
      nom: 'Passerelle Paiement',
      serveur: 'SRV-04',
      version: 'v4.0.7',
      statut: 'Arrêtée',
      heure: '10:30',
      description: 'Service de gestion des flux de paiement et validation des transactions.',
      responsable: 'Équipe Monétique',
      environnement: 'Préproduction',
      technologie: ['Java', 'Kafka', 'PostgreSQL'],
      disponibilite: 0,
      latence: 0,
      charge: 0,
      incidents: 4,
      dernierDeploiement: '05/03/2026',
      utilisateurs: '0'
    },
    {
      id: 5,
      nom: 'Service Reporting',
      serveur: 'SRV-05',
      version: 'v1.9.3',
      statut: 'En ligne',
      heure: '10:50',
      description: 'Génération des rapports financiers et tableaux de bord métiers.',
      responsable: 'Équipe BI',
      environnement: 'Production',
      technologie: ['Python', 'FastAPI', 'Power BI'],
      disponibilite: 97,
      latence: 160,
      charge: 48,
      incidents: 1,
      dernierDeploiement: '11/03/2026',
      utilisateurs: '420'
    },
    {
      id: 6,
      nom: 'Gestion KYC',
      serveur: 'SRV-06',
      version: 'v2.2.0',
      statut: 'Maintenance',
      heure: '11:10',
      description: 'Module de vérification d’identité et conformité client.',
      responsable: 'Équipe Conformité',
      environnement: 'Production',
      technologie: ['React', 'Java', 'Elastic'],
      disponibilite: 88,
      latence: 210,
      charge: 36,
      incidents: 0,
      dernierDeploiement: '09/03/2026',
      utilisateurs: '215'
    }
  ];

  selectedApplication: ApplicationItem = this.applications[0];

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
        savedUser.username ||
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
}