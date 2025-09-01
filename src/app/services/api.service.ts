import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../model/user.model';
import { Centre } from '../model/centre.model';
import { DevisRequestDTO, DevisResponseDTO } from '../model/devis.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api'; // URL de votre backend

  constructor(private http: HttpClient) { }

  // Gestion centralisée des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // ================= CENTRES =================
  getCenters(): Observable<Centre[]> {
    return this.http.get<Centre[]>(`${this.apiUrl}/centres`)
      .pipe(catchError(this.handleError));
  }

  createCenter(center: Centre): Observable<Centre> {
    return this.http.post<Centre>(`${this.apiUrl}/centres`, center)
      .pipe(catchError(this.handleError));
  }

  // ================= UTILISATEURS =================
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/agents`)
      .pipe(catchError(this.handleError));
  }

  getUsersByCenter(centerId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/centres/${centerId}/users`)
      .pipe(catchError(this.handleError));
  }

  assignUserToCenter(userId: number, centerId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/centres/${centerId}/affecter/${userId}`, {}
    ).pipe(catchError(this.handleError));
  }

  // ================= DEMANDES =================
  getDemandesByCentre(centreId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/demandes/interventions/centre/${centreId}`);
  }

  getDemandesPourAgent() {
    return this.http.get<any[]>(`${this.apiUrl}/demandes/interventions/mes`);
  }

  updateDemande(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/demandes/interventions/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  // ================= DEVIS =================
  getDevisByAgent(agentId: number): Observable<DevisResponseDTO[]> {
    return this.http.get<DevisResponseDTO[]>(`${this.apiUrl}/devis/agent/${agentId}`);
  }

  getDevisByCentre(centerId: number): Observable<DevisResponseDTO[]> {
    return this.http.get<DevisResponseDTO[]>(`${this.apiUrl}/devis/centre/${centerId}`);
  }

  getAllDevis(): Observable<DevisResponseDTO[]> {
    return this.http.get<DevisResponseDTO[]>(`${this.apiUrl}/devis`);
  }

  createDevis(dto: DevisRequestDTO): Observable<DevisResponseDTO> {
    return this.http.post<DevisResponseDTO>(`${this.apiUrl}/devis`, dto);
  }

  updateDevis(id: number, dto: DevisRequestDTO): Observable<DevisResponseDTO> {
    return this.http.put<DevisResponseDTO>(`${this.apiUrl}/devis/${id}`, dto);
  }
}
