import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
interface DemandeBranchement {
  id: number;
  client: string;
  date: string;
  status: 'new' | 'in-progress' | 'completed';
  description: string;
  nom: string;
  prenom: string;
  email: string;
  cin: string;
  telephone: string;
  adresse: string;
  latitude: string;
  longitude: string;
  natureClient: string;
  usage: string;
}


@Injectable({
  providedIn: 'root'
})

export class AdminService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Centres
  getCentres(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/centres`);
  }

  createCentre(centre: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/centres`, centre);
  }

  // Utilisateurs
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  affectUserToCentre(userId: number, centreId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/affect-user`, {userId, centreId});
  }

  // Statistiques
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
  // admin.service.ts
normalizeUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    nom: user.nom || user.name,
    prenom: user.prenom || '',
    role: user.role || 'USER',
    active: user.active !== false,
    name: user.nom || user.name // Optionnel pour rétrocompatibilité
  };
}
// admin.service.ts
getAllDemandes() {
  return this.http.get<DemandeBranchement[]>(`http://localhost:8080/api/demandes/interventions`);
}

getAllDevis() {
  return this.http.get<any[]>(`http://localhost:8080/api/devis`);
}

}