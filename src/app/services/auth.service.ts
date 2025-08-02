import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
   // auth.service.ts
   // auth.service.ts
signup(userData: {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  password: string;
}): Observable<any> {
  return this.http.post('http://localhost:8080/api/auth/signup', userData).pipe(
    catchError(error => {
      return throwError(() => new Error(error.error.message || 'Erreur lors de l\'inscription'));
    })
  );
}
  // Authentification basée sur le backend (session/cookie)
login(email: string, password: string): Observable<any> {
  return this.http.post<any>('http://localhost:8080/api/auth/login', {
    email,
    password
  }).pipe(
    catchError(error => {
      console.error('Erreur de login:', error);
      let errorMsg = 'Échec de la connexion';
      
      if (error.status === 401) {
        errorMsg = 'Email ou mot de passe incorrect';
      } else if (error.status === 0) {
        errorMsg = 'Serveur indisponible';
      }
      
      return throwError(() => new Error(errorMsg));
    })
  );
}
  // Vérifie si l'utilisateur est authentifié via le backend
  isLoggedIn(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  // Récupère les infos de l'utilisateur depuis le backend
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current-user`, { withCredentials: true }).pipe(
      catchError(() => of(null))
    );
  }

  // Récupère le rôle de l'utilisateur depuis le backend
  getCurrentUserRole(): Observable<string> {
    return this.getCurrentUser().pipe(
      map(user => user?.roles?.[0] || ''),
      catchError(() => of(''))
    );
  }

  // Vérification des rôles
  hasRole(requiredRole: string): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        const roles = user?.roles || [];
        const normalizedRole = this.normalizeRole(requiredRole);
        return roles.includes(normalizedRole);
      }),
      catchError(() => of(false))
    );
  }

  hasAnyRole(requiredRoles: string[]): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        const userRoles = user?.roles || [];
        return requiredRoles.some(role => 
          userRoles.includes(this.normalizeRole(role))
        );
      }),
      catchError(() => of(false))
    );
  }

  private normalizeRole(role: string): string {
    return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
  }

  // Redirection basée sur le rôle
   redirectBasedOnRole(roles: string[]): void {
    const mainRole = this.getMainRole(roles);
    
    switch (mainRole) {
      case 'ROLE_ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'ROLE_AGENT':
        this.router.navigate(['/agent-dashboard']);
        break;
      case 'ROLE_CLIENT':
        this.router.navigate(['/client-dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

   private getMainRole(roles: string[]): string {
    const priorityRoles = ['ROLE_ADMIN', 'ROLE_AGENT', 'ROLE_CLIENT'];
    return priorityRoles.find(role => roles.includes(role)) || roles[0] || '';
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      })
    );
  }

  // Gestion des erreurs
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