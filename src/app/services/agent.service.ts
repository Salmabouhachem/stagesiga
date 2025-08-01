import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:8080/api/demandes';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Créer une demande de devis
  creerDemande(demande: any) {
    return this.http.post(`${this.apiUrl}`, demande, { headers: this.getHeaders() });
  }

  // Lister les demandes
  getDemandesAgent() {
    return this.http.get(`${this.apiUrl}/mes-demandes`, { headers: this.getHeaders() });
  }

  // Créer un devis
  creerDevis(devis: any, demandeId: number) {
    return this.http.post(`${this.apiUrl}/${demandeId}/devis`, devis, { headers: this.getHeaders() });
  }
}