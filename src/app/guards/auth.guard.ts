import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap, take, tap } from 'rxjs/operators';

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
    const userJson = localStorage.getItem('currentUser');
    let user: any = null;

    if (userJson) {
      user = JSON.parse(userJson);
    }

    if (!user) {
      console.warn('AuthGuard: No user found in localStorage, redirecting to login');
      return of(this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      }));
    }

    const normalizeRole = (role: string) => role.toUpperCase().replace(/^ROLE_/, '');
    const requiredRoles = (route.data['roles'] as string[] || []).map(normalizeRole);
    if (requiredRoles.length === 0) return of(true);

    // ✅ Correction ici
    const userRoles: string[] = (() => {
      if (Array.isArray(user.authorities) && user.authorities.length > 0) {
        if (typeof user.authorities[0] === 'string') {
          return user.authorities;
        }
        if (typeof user.authorities[0] === 'object') {
          return user.authorities.map((a: any) => a.authority);
        }
      }
      return user.role ? [user.role] : [];
    })();

    const hasAccess = requiredRoles.some(required =>
      userRoles.some((userRole: string) =>
        userRole.toUpperCase() === required.toUpperCase() ||
        userRole.toUpperCase() === 'ROLE_' + required.toUpperCase()
      )
    );

    console.log('User roles:', userRoles);
    console.log('Required roles:', requiredRoles);

    if (!hasAccess) {
      console.warn('AuthGuard: Access denied for roles', requiredRoles);
      return of(this.router.parseUrl('/access-denied'));
    }

    return of(true);
  }
}
