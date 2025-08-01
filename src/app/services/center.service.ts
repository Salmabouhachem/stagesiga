// src/app/services/centre.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Centre } from '../model/centre.model';

@Injectable({
  providedIn: 'root'
})
export class CentreService {
  private apiUrl = 'http://localhost:8080/api/centres';

  constructor(private http: HttpClient) { }

  getCentres(): Observable<Centre[]> {
    return this.http.get<Centre[]>(this.apiUrl);
  }

  createCentre(centre: Centre): Observable<Centre> {
    return this.http.post<Centre>(this.apiUrl, centre);
  }

  affecterUser(userId: number, centreId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${centreId}/affecter/${userId}`, {});
  }
}