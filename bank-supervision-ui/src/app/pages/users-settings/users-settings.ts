import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users-settings.html',
  styleUrls: ['./users-settings.css']
})
export class UserSettings {
  message = '';

  profile = {
    fullName: 'Utilisateur',
    email: 'user@bank.com',
    language: 'Français',
    theme: 'Sombre'
  };

  preferences = {
    emailNotifications: true,
    smsNotifications: false,
    darkMode: true
  };

  constructor(private router: Router) {}

  saveSettings(): void {
    this.message = 'Paramètres utilisateur enregistrés avec succès.';
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  resetSettings(): void {
    this.profile = {
      fullName: 'Utilisateur',
      email: 'user@bank.com',
      language: 'Français',
      theme: 'Sombre'
    };

    this.preferences = {
      emailNotifications: true,
      smsNotifications: false,
      darkMode: true
    };

    this.message = 'Paramètres utilisateur réinitialisés.';
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}