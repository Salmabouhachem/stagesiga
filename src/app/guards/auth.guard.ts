import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';

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
  ): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn().pipe(
      take(1),
      mergeMap(isLoggedIn => {
        console.log('=== Debug AuthGuard ===');
        console.log('URL demandée:', state.url);
        console.log('Utilisateur connecté:', isLoggedIn);

        if (!isLoggedIn) {
          console.warn('Redirection vers login - Non authentifié');
          return of(this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          }));
        }

        const requiredRoles = route.data['roles'] as string[];
        if (!requiredRoles || requiredRoles.length === 0) {
          return of(true);
        }

        return this.authService.hasAnyRole(requiredRoles).pipe(
          take(1),
          tap(hasRole => {
            console.log('Rôles utilisateur:', this.authService.getCurrentUserRole());
            console.log('Rôles requis:', requiredRoles);
          }),
          mergeMap(hasRole => {
            if (!hasRole) {
              console.warn('Redirection vers accès refusé - Rôles insuffisants');
              return of(this.router.createUrlTree(['/access-denied']));
            }
            return of(true);
          })
        );
      })
    );
  }
}