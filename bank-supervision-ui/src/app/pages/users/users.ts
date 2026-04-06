import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface UserItem {
  id: number;
  nom: string;
  email: string;
  role: 'Admin' | 'User';
  statut: 'Actif' | 'Désactivé';
  password?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users {
  query = '';
  filterRole: 'Tous' | 'Admin' | 'User' = 'Tous';
  filterStatut: 'Tous' | 'Actif' | 'Désactivé' = 'Tous';

  showAdd = false;
  showEdit = false;
  showDelete = false;

  users: UserItem[] = [
    {
      id: 1,
      nom: 'Yassine Sakhri',
      email: 'yassine@bank.com',
      role: 'Admin',
      statut: 'Actif',
      password: '123456'
    },
    {
      id: 2,
      nom: 'Amine Trabelsi',
      email: 'amine@bank.com',
      role: 'User',
      statut: 'Actif',
      password: '123456'
    },
    {
      id: 3,
      nom: 'Sarra Ben Ali',
      email: 'sarra@bank.com',
      role: 'User',
      statut: 'Désactivé',
      password: '123456'
    }
  ];

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

  openAdd(): void {
    this.addForm = this.createEmptyUser();
    this.showAdd = true;
  }

  closeAdd(): void {
    this.showAdd = false;
    this.addForm = this.createEmptyUser();
  }

  addUser(): void {
    if (!this.addForm.nom.trim() || !this.addForm.email.trim() || !this.addForm.password?.trim()) {
      return;
    }

    const newUser: UserItem = {
      id: Date.now(),
      nom: this.addForm.nom.trim(),
      email: this.addForm.email.trim(),
      role: this.addForm.role,
      statut: this.addForm.statut,
      password: this.addForm.password.trim()
    };

    this.users = [newUser, ...this.users];
    this.closeAdd();
  }

  openEdit(user: UserItem): void {
    this.editForm = { ...user };
    this.showEdit = true;
  }

  closeEdit(): void {
    this.showEdit = false;
    this.editForm = this.createEmptyUser();
  }

  saveEdit(): void {
    this.users = this.users.map((u) =>
      u.id === this.editForm.id ? { ...this.editForm } : u
    );
    this.closeEdit();
  }

  openDelete(user: UserItem): void {
    this.deleteTarget = user;
    this.showDelete = true;
  }

  closeDelete(): void {
    this.showDelete = false;
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;

    this.users = this.users.filter((u) => u.id !== this.deleteTarget!.id);
    this.closeDelete();
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
}