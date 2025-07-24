import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface User {
  email: string;
  name: string;
  active: boolean;
}

interface Request {
  id: number;
  client: string;
  date: string;
  status: 'new' | 'in-progress' | 'completed';
  description: string;
}

interface Quote {
  id: number;
  client: string;
  date: string;
  status: 'pending' | 'processed' | 'rejected';
  description: string;
}

interface AppData {
  users: { [email: string]: User };
  requests: Request[];
  quotes: Quote[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentSection = 'dashboard';
  adminName = '';
  
  // Données réelles
  activeUsers = 0;
  todayRequests = 0;
  pendingQuotes = 0;
  
  requests: Request[] = [];
  quotes: Quote[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.initAppData();
    this.loadAdminName();
    this.loadRealData();
  }

  private initAppData(): void {
    if (!this.getAppData()) {
      const initialData: AppData = {
        users: {
          'admin@example.com': {
            email: 'admin@example.com',
            name: 'Administrateur',
            active: true
          }
        },
        requests: [],
        quotes: []
      };
      this.saveAppData(initialData);
    }
  }

  private loadAdminName(): void {
    const user = this.authService.getCurrentUser();
    this.adminName = user?.name || user?.email?.split('@')[0] || 'Admin';
  }

  private getAppData(): AppData | null {
    try {
      const data = localStorage.getItem('appData');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error parsing appData', e);
      return null;
    }
  }

  private saveAppData(data: AppData): void {
    localStorage.setItem('appData', JSON.stringify(data));
  }

  private loadRealData(): void {
    const appData = this.getAppData();
    if (!appData) return;

    // Statistiques
    this.activeUsers = Object.values(appData.users)
      .filter(user => user.active).length;
    
    const today = new Date().toISOString().split('T')[0];
    this.todayRequests = appData.requests
      .filter(req => req.date === today).length;
    
    this.pendingQuotes = appData.quotes
      .filter(quote => quote.status === 'pending').length;
    
    // Données pour les listes
    this.requests = [...appData.requests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    this.quotes = [...appData.quotes]
      .filter(quote => quote.status === 'pending');
  }

  getClientName(clientEmail: string): string {
    const appData = this.getAppData();
    return appData?.users[clientEmail]?.name || clientEmail;
  }

  addNewUser(user: User): void {
    const appData = this.getAppData();
    if (!appData) return;

    appData.users[user.email] = user;
    this.saveAppData(appData);
    this.loadRealData();
  }

  addRequest(request: Omit<Request, 'id' | 'date' | 'status'>): void {
    const appData = this.getAppData();
    if (!appData) return;

    const newRequest: Request = {
      ...request,
      id: this.generateId(),
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    };

    appData.requests.push(newRequest);
    this.saveAppData(appData);
    this.loadRealData();
  }

  processQuote(quoteId: number): void {
    const appData = this.getAppData();
    if (!appData) return;

    appData.quotes = appData.quotes.map(quote => 
      quote.id === quoteId ? { ...quote, status: 'processed' } : quote
    );

    this.saveAppData(appData);
    this.loadRealData();
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  logout(): void {
    this.authService.logout();
  }
}