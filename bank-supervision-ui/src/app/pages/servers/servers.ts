import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ServerService, ServerApi } from '../../services/server.service';

interface ServerItem {
  id?: number;
  name: string;
  ip: string;
  port: string;
  os: string;
  status: string;
  lastCheck: string;
  system: string;
}

const DEFAULT_LAST_CHECK = '--:--';
const DEFAULT_STATUS = 'ONLINE';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './servers.html',
  styleUrls: ['./servers.css']
})
export class Servers implements OnInit {
  private serverService = inject(ServerService);
  private cdr = inject(ChangeDetectorRef);

  query = '';
  showAdd = false;
  showOs = false;

  currentPage = 1;
  itemsPerPage = 6;

  loading = false;
  error = '';
  addError = '';
  editError = '';
  deleteError = '';

  servers: ServerItem[] = [];

  form: ServerItem = this.createEmptyForm();
  editForm: ServerItem = this.createEmptyForm();
  deleteTarget: ServerItem | null = null;
  showEdit = false;
  showDelete = false;

  ngOnInit(): void {
    this.loadServers();
  }

  loadServers(): void {
    this.loading = true;
    this.error = '';

    this.serverService.getServers().subscribe({
      next: (data) => {
        this.servers = data.map((server) => this.mapApiToUi(server));
        this.currentPage = 1;
        this.finishLoading();
      },
      error: (error) => {
        console.error('Erreur chargement serveurs :', error);
        this.error = 'Impossible de charger les serveurs.';
        this.finishLoading();
      }
    });
  }

  mapApiToUi(server: ServerApi): ServerItem {
    return {
      id: server.id,
      name: server.name ?? '-',
      ip: server.ipAddress ?? '-',
      port: server.port !== undefined && server.port !== null ? String(server.port) : '-',
      os: server.os ?? '-',
      status: server.status ?? DEFAULT_STATUS,
      lastCheck: this.formatTime(server.lastCheck),
      system: server.system ?? 'Core'
    };
  }

  formatTime(dateValue?: string): string {
    if (!dateValue) return DEFAULT_LAST_CHECK;

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return DEFAULT_LAST_CHECK;
    }

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  get filteredServers(): ServerItem[] {
    const q = this.query.trim().toLowerCase();

    if (!q) {
      return this.servers;
    }

    return this.servers.filter(server =>
      this.includesQuery(server.name, q) ||
      this.includesQuery(server.ip, q) ||
      this.includesQuery(server.port, q) ||
      this.includesQuery(server.os, q) ||
      this.includesQuery(server.status, q) ||
      this.includesQuery(server.lastCheck, q)
    );
  }

  get totalPages(): number {
    const total = Math.ceil(this.filteredServers.length / this.itemsPerPage);
    return total > 0 ? total : 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedServers(): ServerItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredServers.slice(start, end);
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

  openAddServer(): void {
    this.showAdd = true;
    this.addError = '';
    this.form = this.createEmptyForm();
  }

  closeAddServer(): void {
    this.showAdd = false;
    this.showOs = false;
    this.addError = '';
    this.resetForm();
  }

  toggleOs(): void {
    this.showOs = !this.showOs;
  }

  chooseOs(os: string): void {
    this.form.os = os;
    this.showOs = false;
  }

  addServer(): void {
    if (this.loading) return;
    this.addError = '';

    if (!this.form.name.trim()) {
      this.addError = 'Le nom du serveur est obligatoire';
      this.cdr.detectChanges();
      return;
    }
    if (!this.form.ip.trim()) {
      this.addError = "L'adresse IP est obligatoire";
      this.cdr.detectChanges();
      return;
    }
    if (!this.form.port.trim()) {
      this.addError = 'Le port est obligatoire';
      this.cdr.detectChanges();
      return;
    }
    if (!this.form.os.trim()) {
      this.addError = "L'OS est obligatoire";
      this.cdr.detectChanges();
      return;
    }

    const payload: ServerApi = {
      name: this.form.name.trim(),
      ipAddress: this.form.ip.trim(),
      port: Number(this.form.port),
      os: this.form.os.trim(),
      status: this.form.status || DEFAULT_STATUS,
      system: this.form.system
    };

    this.loading = true;
    this.cdr.detectChanges();

    this.serverService.addServer(payload).subscribe({
      next: () => {
        this.loading = false;
        this.loadServers();
        this.closeAddServer();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur ajout serveur (backend) :', error);
        this.addError = error.error?.message || "Impossible d'ajouter le serveur.";
        this.cdr.detectChanges();
      }
    });
  }

  openEdit(server: ServerItem): void {
    this.editForm = { ...server };
    this.editError = '';
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
    this.editError = '';
    this.editForm = this.createEmptyForm();
  }

  saveEdit(): void {
    if (this.loading) return;
    this.editError = '';
    if (!this.editForm.id) return;

    if (!this.editForm.name.trim()) {
      this.editError = 'Le nom est obligatoire';
      this.cdr.detectChanges();
      return;
    }
    if (!this.editForm.ip.trim()) {
      this.editError = "L'adresse IP est obligatoire";
      this.cdr.detectChanges();
      return;
    }

    const payload: ServerApi = {
      name: this.editForm.name.trim(),
      ipAddress: this.editForm.ip.trim(),
      port: Number(this.editForm.port),
      os: this.editForm.os.trim(),
      status: this.editForm.status,
      system: this.editForm.system
    };

    this.loading = true;
    this.cdr.detectChanges();

    this.serverService.updateServer(this.editForm.id, payload).subscribe({
      next: () => {
        this.loading = false;
        this.loadServers();
        this.closeEdit();
      },
      error: (error) => {
        this.loading = false;
        this.editError = error.error?.message || "Impossible de modifier le serveur.";
        this.cdr.detectChanges();
      }
    });
  }

  openDelete(server: ServerItem): void {
    this.deleteTarget = server;
    this.deleteError = '';
    this.showDelete = true;
  }

  closeDelete(): void {
    this.showDelete = false;
    this.deleteError = '';
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget || !this.deleteTarget.id || this.loading) return;
    this.deleteError = '';

    this.loading = true;
    this.cdr.detectChanges();

    this.serverService.deleteServer(this.deleteTarget.id).subscribe({
      next: () => {
        this.loading = false;
        this.loadServers();
        this.closeDelete();
      },
      error: (error) => {
        this.loading = false;
        this.deleteError = error.error?.message || "Impossible de supprimer le serveur.";
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
  }

  getStatusClass(status: string): string {
    const value = status.toLowerCase();

    if (value === 'online') return 'online';
    if (value === 'offline') return 'offline';
    if (value === 'warning') return 'warning';
    if (value === 'critical') return 'critical';
    if (value === 'maintenance') return 'maintenance';

    return '';
  }

  private createEmptyForm(): ServerItem {
    return {
      name: '',
      ip: '',
      port: '',
      os: '',
      status: DEFAULT_STATUS,
      lastCheck: DEFAULT_LAST_CHECK,
      system: 'Core'
    };
  }

  private includesQuery(value: string, query: string): boolean {
    return value.toLowerCase().includes(query);
  }

  private isFormValid(): boolean {
    return Boolean(
      this.form.name.trim() &&
      this.form.ip.trim() &&
      this.form.port.trim() &&
      this.form.os.trim()
    );
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
