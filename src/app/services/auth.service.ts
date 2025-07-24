import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Redirection basée sur le rôle
 getCurrentUser(): any {
  try {
    const userData = localStorage.getItem('authData');
    if (!userData) return null;
    
    const parsed = JSON.parse(userData);
    return parsed?.user || parsed || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Inscription
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // Connexion
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveUserData(response.token, response.email, response.roles);
          this.redirectBasedOnRole(response.roles);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Enregistrement des données utilisateur
  private saveUserData(token: string, email: string, roles: string[]): void {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  // Redirection basée sur le rôle
  private redirectBasedOnRole(roles: string[]): void {
    if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  // Récupération du rôle
  getUserRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  // Vérification admin
  isAdmin(): boolean {
    return this.getUserRoles().includes('ROLE_ADMIN');
  }
  

  // Déconnexion
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Connexion au serveur impossible';
    }
    return throwError(() => new Error(errorMessage));
  }
}