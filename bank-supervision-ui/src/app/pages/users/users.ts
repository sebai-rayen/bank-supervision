import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { UsersService, PersonneResponse, RoleType } from '../../services/users.service';

interface UserItem {
  id: number;
  nom: string;
  email: string;
  role: 'Admin' | 'User';
  statut: 'Actif' | 'Désactivé';
  roleType?: RoleType;
  active?: boolean;
  password?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  query = '';
  filterRole: 'Tous' | 'Admin' | 'User' = 'Tous';
  filterStatut: 'Tous' | 'Actif' | 'Désactivé' = 'Tous';

  showAdd = false;
  showEdit = false;
  showDelete = false;

  addError = '';
  editError = '';
  deleteError = '';

  currentPage = 1;
  itemsPerPage = 6;

  loading = false;
  error = '';
  users: UserItem[] = [];

  constructor(
    private usersService: UsersService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.currentPage = 1;

    this.usersService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (items) => {
          this.users = items.map((u) => this.fromApi(u));
          this.cd.detectChanges();
        },
        error: (err) => {
          this.error =
            this.readApiMessage(err) || 'Impossible de charger les utilisateurs';
        }
      });
  }

  addForm: UserItem = this.createEmptyUser();
  editForm: UserItem = this.createEmptyUser();
  deleteTarget: UserItem | null = null;

  filteredUsers(): UserItem[] {
    const q = this.query.trim().toLowerCase();

    return this.users.filter((u) => {
      const matchQuery =
        !q ||
        u.nom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.statut.toLowerCase().includes(q);

      const matchRole =
        this.filterRole === 'Tous' || u.role === this.filterRole;

      const matchStatut =
        this.filterStatut === 'Tous' || u.statut === this.filterStatut;

      return matchQuery && matchRole && matchStatut;
    });
  }

  get totalPages(): number {
    const total = Math.ceil(this.filteredUsers().length / this.itemsPerPage);
    return total > 0 ? total : 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedUsers(): UserItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers().slice(start, start + this.itemsPerPage);
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

  openAdd(): void {
    this.addForm = this.createEmptyUser();
    this.addError = '';
    this.showAdd = true;
  }

  closeAdd(): void {
    this.showAdd = false;
    this.addError = '';
    this.addForm = this.createEmptyUser();
  }

  addUser(): void {
    this.addError = '';

    if (!this.addForm.nom.trim()) {
      this.addError = 'Le nom est obligatoire';
      return;
    }

    const namePattern = /^[\p{L} '-]+$/u;
    if (!namePattern.test(this.addForm.nom.trim())) {
      this.addError = 'Le nom ne doit contenir que des lettres';
      return;
    }

    if (!this.addForm.email.trim()) {
      this.addError = "L'adresse e-mail est obligatoire";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.addForm.email.trim())) {
      this.addError = "L'adresse e-mail n'est pas valide";
      return;
    }

    const pass = (this.addForm.password ?? '').trim();
    if (!pass) {
      this.addError = 'Le mot de passe est obligatoire';
      return;
    }

    if (pass.length < 8) {
      this.addError = 'Le mot de passe doit contenir au moins 8 caractères';
      return;
    }

    const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/;
    if (!passPattern.test(pass)) {
      this.addError = 'Le mot de passe doit contenir des majuscules, minuscules, chiffres et caractères spéciaux';
      return;
    }

    const roleType: RoleType = this.addForm.role === 'Admin' ? 'ADMIN' : 'USER';
    const active = this.addForm.statut === 'Actif';

    this.usersService
      .create({
        name: this.addForm.nom.trim(),
        email: this.addForm.email.trim(),
        password: (this.addForm.password ?? '').trim(),
        roleType,
        active
      })
      .subscribe({
        next: (created) => {
          this.users = [this.fromApi(created), ...this.users];
          this.closeAdd();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.addError = this.readApiMessage(err) || "Impossible d'ajouter l'utilisateur";
          this.cd.detectChanges();
        }
      });
  }

  openEdit(user: UserItem): void {
    this.editForm = { ...user };
    this.editError = '';
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
    this.editError = '';
    this.editForm = this.createEmptyUser();
  }

  saveEdit(): void {
    this.editError = '';
    const userId = this.editForm.id;

    if (!this.editForm.nom.trim()) {
      this.editError = 'Le nom est obligatoire';
      return;
    }

    const namePattern = /^[\p{L} '-]+$/u;
    if (!namePattern.test(this.editForm.nom.trim())) {
      this.editError = 'Le nom ne doit contenir que des lettres';
      return;
    }

    if (!this.editForm.email.trim()) {
      this.editError = "L'adresse e-mail est obligatoire";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.editForm.email.trim())) {
      this.editError = "L'adresse e-mail n'est pas valide";
      return;
    }

    const active = this.editForm.statut === 'Actif';

    this.usersService.update(userId, {
      nom: this.editForm.nom.trim(),
      email: this.editForm.email.trim(),
      active
    }).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((u) =>
          u.id === userId ? this.fromApi(updatedUser) : u
        );
        this.closeEdit();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.editError = this.readApiMessage(err) || "Impossible de modifier l'utilisateur";
        this.cd.detectChanges();
      }
    });
  }

  openDelete(user: UserItem): void {
    this.deleteTarget = user;
    this.deleteError = '';
    this.showDelete = true;
  }

  closeDelete(): void {
    this.showDelete = false;
    this.deleteError = '';
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleteError = '';

    const userId = this.deleteTarget.id;
    this.usersService.delete(userId).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== userId);
        this.closeDelete();
        this.cd.detectChanges();
      },
      error: (err) => {
        this.deleteError = this.readApiMessage(err) || "Impossible de supprimer l'utilisateur";
        this.cd.detectChanges();
      }
    });
  }

  onActiveToggle(
    form: { statut: 'Actif' | 'Désactivé' },
    event: Event
  ): void {
    const checked = (event.target as HTMLInputElement).checked;
    form.statut = checked ? 'Actif' : 'Désactivé';
  }

  private createEmptyUser(): UserItem {
    return {
      id: 0,
      nom: '',
      email: '',
      role: 'User',
      statut: 'Actif',
      password: ''
    };
  }

  private fromApi(u: PersonneResponse): UserItem {
    const role = u.roleType === 'ADMIN' ? 'Admin' : 'User';
    const statut = u.active ? 'Actif' : 'Désactivé';
    return {
      id: u.id,
      nom: u.nom,
      email: u.email,
      role,
      statut,
      roleType: u.roleType,
      active: u.active
    };
  }

  private readApiMessage(err: any): string {
    let message = typeof err?.error === 'string' ? err.error : err?.error?.message;
    if (typeof message !== 'string') return '';

    // Map backend translation keys to user-friendly messages
    if (message.includes('VALIDATION.REGISTRATION.NAME.PATTERN')) {
      return 'Le nom ne doit contenir que des lettres';
    }
    if (message.includes('VALIDATION.REGISTRATION.PASSWORD.WEAK')) {
      return 'Le mot de passe doit contenir des majuscules, minuscules, chiffres et caractères spéciaux';
    }
    if (message.includes('VALIDATION.REGISTRATION.PASSWORD.SIZE')) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    return message;
  }
}
