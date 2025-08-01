import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { JwtHelper } from './jwt.helper';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly roleRoutes: { [key: string]: string } = {
    'ROLE_ADMIN': '/admin-dashboard',
    'ROLE_AGENT': '/agent-dashboard', 
    'ROLE_CLIENT': '/client-dashboard',
    'DEFAULT': '/profile'
  };
    getCurrentUserRole(): string {
    // Implémentation exemple - adaptez à votre code réel
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role || '';
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelper
  ) {}

  // Authentication methods
  isLoggedIn(): boolean {
  const token = this.getToken();
  if (!token) return false;
  
  // Vérifie l'expiration du token
  const isExpired = this.jwtHelper.isTokenExpired(token);
  if (isExpired) {
    console.warn('Token expiré');
    this.logout();
  }
  return !isExpired;
}

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveAuthData(response);
          this.redirectBasedOnRole(response.roles);
        }
      }),
      catchError(this.handleError)
    );
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // Token and role management
  private saveAuthData(authResponse: any): void {
    const authData = {
      token: authResponse.token,
      user: {
        email: authResponse.email,
        roles: authResponse.roles || [],
        id: authResponse.id
      }
    };
    localStorage.setItem('authData', JSON.stringify(authData));
  }
  hasAnyRole(requiredRoles: string[]): boolean {
  const userRoles = this.getUserRoles();
  return requiredRoles.some(role => 
    userRoles.includes(this.normalizeRole(role))
  );
}

  getCurrentUser(): any {
    try {
      const authData = localStorage.getItem('authData');
      return authData ? JSON.parse(authData).user : null;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      this.logout();
      return null;
    }
  }

  getToken(): string | null {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData).token : null;
  }

  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }

  // Role checking
  hasRole(requiredRole: string): boolean {
    const userRoles = this.getUserRoles();
    const normalizedRole = this.normalizeRole(requiredRole);
    return userRoles.includes(normalizedRole);
  }

  private normalizeRole(role: string): string {
    return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isAgent(): boolean {
    return this.hasRole('AGENT');
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  // Token validation
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      return !this.jwtHelper.isTokenExpired(token) && 
             this.hasRequiredClaims(token);
    } catch {
      return false;
    }
  }

  private hasRequiredClaims(token: string): boolean {
    const payload = this.jwtHelper.decodePayload(token);
    return !!payload?.sub && Array.isArray(payload.roles);
  }

  // Navigation
  private redirectBasedOnRole(userRoles: string[]): void {
    const returnUrl = this.getReturnUrl();
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    const mainRole = this.getMainRole(userRoles);
    const targetRoute = this.roleRoutes[mainRole] || this.roleRoutes['DEFAULT'];
    this.router.navigate([targetRoute]);
  }

  private getReturnUrl(): string | null {
    const urlTree = this.router.parseUrl(this.router.url);
    return urlTree.queryParams['returnUrl'] || null;
  }

  private getMainRole(roles: string[]): string {
    const priorityRoles = ['ROLE_ADMIN', 'ROLE_AGENT', 'ROLE_CLIENT'];
    return priorityRoles.find(role => roles.includes(role)) || roles[0] || 'DEFAULT';
  }

  // Logout
  logout(): void {
    localStorage.removeItem('authData');
    this.router.navigate(['/login']);
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Erreur lors de l\'authentification';
    
    if (error.status === 0) {
      errorMessage = 'Serveur indisponible';
    } else if (error.status === 401) {
      errorMessage = 'Identifiants incorrects';
    } else if (error.status === 403) {
      errorMessage = 'Permissions insuffisantes';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}