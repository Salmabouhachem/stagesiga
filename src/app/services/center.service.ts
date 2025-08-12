import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Centre {
  id?: number;
  code: string;
  nom: string;
  ville: string;
  adresse: string;
}

@Injectable({
  providedIn: 'root'
})
export class CentreService {
  private baseUrl = 'http://localhost:8080/api/centres';

  constructor(private http: HttpClient) {}

  getAllCentres(): Observable<Centre[]> {
    return this.http.get<Centre[]>(this.baseUrl);
  }

  createCentre(centre: Centre): Observable<Centre> {
    return this.http.post<Centre>(this.baseUrl, centre);
  }

  affecterUserToCentre(centreId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${centreId}/affecter/${userId}`, {});
  }
}
