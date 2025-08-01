import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = 'http://localhost:8080/api/quotes';

  constructor(private http: HttpClient) {}

  getClientQuotes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-quotes`);
  }

  acceptQuote(quoteId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${quoteId}/accept`, {});
  }
}