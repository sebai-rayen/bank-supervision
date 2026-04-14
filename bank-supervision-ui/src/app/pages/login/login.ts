import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  email = '';
  password = '';
  error = '';
  showPassword = false;
  rememberMe = false;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.clearPreviousSession();
  }

  private clearPreviousSession(): void {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erreur décodage token :', error);
      return null;
    }
  }

  onSubmit(): void {
    if (!this.isBrowser) return;

    this.error = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    const request: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: (res) => {
        console.log('Résultat login :', res);

        // selon ton backend actuel
        const accessToken = res.access_token || res.access_token;
        const refreshToken = res.refresh_token || res.refresh_token;
        const tokenType = res.token_type || res.token_type;

        const decodedToken = this.decodeJwt(accessToken);

        const currentUser = {
          name: decodedToken?.name || '',
          email: decodedToken?.email || this.email.trim(),
          token: accessToken,
          refreshToken: refreshToken,
          tokenType: tokenType,
          role: res.role || decodedToken?.role || 'USER'
        };

        if (this.rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          sessionStorage.removeItem('currentUser');
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.removeItem('currentUser');
        }

        const targetRoute = currentUser.role === 'ADMIN' ? '/dashboard' : '/user-dashboard';
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        const message =
          err?.status === 400 && err.error?.message
            ? err.error.message
            : 'Mail ou mot de passe incorrect';

        this.error = message;
        this.cdr.markForCheck();
      }
    });
  }
}