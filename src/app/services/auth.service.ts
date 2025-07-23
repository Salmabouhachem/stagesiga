import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
   private readonly apiUrl = 'http://localhost:8080/api/auth'; // URL complète

  constructor(private http: HttpClient) {}
signup(userData: any): Observable<any> {
  return this.http.post<{status: string, message: string}>(
    'http://localhost:8080/api/auth/signup', 
    userData
  ).pipe(
    catchError(error => {
      // Gestion propre des erreurs
      let errorMessage = 'Erreur inconnue';
      if (error.error instanceof ErrorEvent) {
        // Erreur client-side
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur serveur (même si status 200)
        errorMessage = error.error?.message || error.message;
      }
      return throwError(() => new Error(errorMessage));
    })
  );
}
  
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials)
      .pipe(
        catchError(error => {
          console.error('Erreur de connexion:', error);
          throw this.handleError(error);
        })
      );
  }

  private handleError(error: any): string {
    if (error.status === 0) {
      return 'Erreur de connexion au serveur';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return 'Une erreur inconnue est survenue';
  }
  saveUserData(token: string, email: string, roles: string[]) {
  localStorage.setItem('token', token);                    // stocke le token JWT
  localStorage.setItem('email', email);                    // stocke l'email
  localStorage.setItem('roles', JSON.stringify(roles));    // stocke les rôles sous forme de texte JSON
}
}