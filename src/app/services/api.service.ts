import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../model/user.model';
import { Centre } from '../model/centre.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  getRequests() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:8080/api'; // URL de votre backend

  constructor(private http: HttpClient) { }

  // Gestion centralisée des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // CENTRES
  getCenters(): Observable<Centre[]> {
    return this.http.get<Centre[]>(`${this.apiUrl}/centres`)
      .pipe(catchError(this.handleError));
  }

  createCenter(center: Centre): Observable<Centre> {
    return this.http.post<Centre>(`${this.apiUrl}/centres`, center)
      .pipe(catchError(this.handleError));
  }

  // UTILISATEURS
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/agents`) // Match the backend endpoint
      .pipe(catchError(this.handleError));
  }
  getUsersByCenter(centerId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/centres/${centerId}/users`)
      .pipe(catchError(this.handleError));
  }

  assignUserToCenter(userId: number, centerId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/centres/${centerId}/affecter/${userId}`, 
      {}
    ).pipe(catchError(this.handleError));
  }

  // AGENTS
  getAgentQuotes(agentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agents/${agentId}/quotes`)
      .pipe(catchError(this.handleError));
  }

  getAgentRequests(agentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agents/${agentId}/requests`)
      .pipe(catchError(this.handleError));
  }
  // Ajoutez d'autres méthodes selon vos besoins...
}