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
        console.log('reeeeeeeeeeeeeeeeeesultat',res);
        const currentUser = {
          name: res.name,
          email: this.email.trim(),
          token: res.access_token,
          refreshToken: res.refresh_token,
          tokenType: res.token_type,
          role: res.role
        };

        if (this.rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          sessionStorage.removeItem('currentUser');
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          localStorage.removeItem('currentUser');
        }

        // Navigate based on role
        const targetRoute = res.role === 'ADMIN' ? '/dashboard' : '/user-dashboard';
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
