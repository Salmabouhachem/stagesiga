import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, mergeMap, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  navigate(arg0: string[]): void {
    throw new Error('Method not implemented.');
  }
   private currentUserSubject = new BehaviorSubject<any>(null); // Initialisation correcte
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
  ) {this.loadInitialUser();}
   // auth.service.ts
   // auth.service.ts
     private loadInitialUser(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(this.normalizeUser(user));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }
  private normalizeUser(user: any): any {
    return {
      email: user.email,
      name: user.name || user.nomComplet || `${user.prenom || ''} ${user.nom || ''}`.trim(),
      roles: user.authorities["authority"] || [],
      // Ajoutez d'autres propriétés au besoin
    };
  }
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
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response?.user) {
          const normalizedUser = this.normalizeUser(response.user);
          localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
          this.currentUserSubject.next(normalizedUser);
        }
      })
    );
  }
  // Vérifie si l'utilisateur est authentifié via le backend
  isLoggedIn(): boolean {
  return !!this.getToken();
}

  // Récupère les infos de l'utilisateur depuis le backend
 
getCurrentUser(): Observable<any> {
  return this.currentUserSubject.asObservable();
}


  // Récupère le rôle de l'utilisateur depuis le backend
  // auth.service.ts
getCurrentUserRole(): Observable<string> {
    return this.getCurrentUser().pipe(
      map(user => user?.roles?.[0] || 'USER'),
      catchError(() => of('USER'))
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
getToken(): string | null {
  return localStorage.getItem('jwtToken');
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