import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataPersistenceService {
  private clientData = new BehaviorSubject<any>(null);
  clientData$ = this.clientData.asObservable();
  
  setClientData(data: any) {
    this.clientData.next(data);
  }

  getClientData() {
    return this.clientData.value;
  }

  clearClientData() {
    this.clientData.next(null);
  }
}