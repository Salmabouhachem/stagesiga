import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean {
  console.log('=== Debug AuthGuard ===');
  console.log('URL demandée:', state.url);
  console.log('Utilisateur connecté:', this.authService.isLoggedIn());
  console.log('Token valide:', !!this.authService.getToken());
  console.log('Rôles utilisateur:', this.authService.getUserRoles());
  console.log('Rôles requis:', route.data['roles']);

  if (!this.authService.isLoggedIn()) {
    console.warn('Redirection vers login - Non authentifié');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  const requiredRoles = route.data['roles'];
  if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
    console.warn('Redirection vers login - Rôles insuffisants');
    this.router.navigate(['/access-denied']);
    return false;
  }

  console.log('Accès autorisé');
  return true;
}
}