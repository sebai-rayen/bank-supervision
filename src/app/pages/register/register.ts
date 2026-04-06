import { ChangeDetectorRef, Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegistrationRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';
  showPassword = false;
  showConfirmPassword = false;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {
    if (!this.isBrowser) return;

    this.error = '';
    this.success = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.confirmPassword.trim()
    ) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    const request: RegistrationRequest = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      roleType: 'USER'
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.success = 'Compte créé avec succès';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err) => {
        const apiMessage =
          typeof err?.error === 'string' ? err.error : err?.error?.message;

        if (err?.status === 400 && apiMessage) {
          this.error = apiMessage;
        } else if (err?.status === 409) {
          this.error = apiMessage || 'Ce compte existe déjà';
        } else {
          this.error = 'Erreur serveur';
        }
        this.cdr.markForCheck();
      }
    });
  }
}
