import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

function readCurrentUserToken(): string | null {
  try {
    const raw =
      sessionStorage.getItem('currentUser') ?? localStorage.getItem('currentUser');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.token === 'string' ? parsed.token : null;
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return next(req);

  const token = readCurrentUserToken();
  if (!token) return next(req);

  // Ne force pas d'entête sur les endpoints d'authentification publics
  if (
    req.url.includes('/api/v1/auth/login') ||
    req.url.includes('/api/v1/auth/register') ||
    req.url.includes('/api/v1/auth/refresh')
  ) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};

