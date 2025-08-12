import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = '/api/demandes/interventions';

  constructor(private http: HttpClient) {}

  submitIntervention(demande: any): Observable<any> {
    const token = localStorage.getItem('auth_token');
    console.log('Token:', token); // Debug token
    if (!token) {
        console.error('No token found in localStorage');
        return throwError(() => new Error('No authentication token found'));
    }
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${token}`
    });
    console.log('Headers:', headers); // Debug headers
    return this.http.post(this.apiUrl, demande, {
        withCredentials: true,
        headers
    }).pipe(
        catchError(error => {
            console.error('Erreur complète:', error);
            return throwError(() => this.parseError(error));
        })
    );
}

  private parseError(error: any): string {
    if (error.status === 0) {
      return 'Erreur de connexion au serveur';
    } else if (error.error?.message) {
      return error.error.message;
    }
    return error.message || 'Erreur inconnue';
  }
}