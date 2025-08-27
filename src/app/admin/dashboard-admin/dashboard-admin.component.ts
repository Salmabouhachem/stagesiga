import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { User } from '../../model/user.model';

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
  demandes: DemandeBranchement[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  stats: any = {};
  centres: any[] = [];
  currentView: 'dashboard' | 'stats' | 'centres' | 'users' = 'dashboard';
  adminName = '';
  requests: Request[] = [];
  quotes: Quote[] = [];
  demandes: DemandeBranchement[] = [];
  todayRequests = 0;
  pendingQuotes = 0;
  completedDemandes = 0;

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAdminName();
    this.loadRealData();
    this.loadStats();
    this.loadCentres();
    this.loadUsers();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe(data => {
      this.stats = data;
    });
  }

  loadCentres(): void {
    this.adminService.getCentres().subscribe(data => {
      this.centres = data;
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe(apiUsers => {
      this.users = apiUsers.map(user => ({
        ...user,
        nom: user.nom || user.name || '',
        prenom: user.prenom || '',
        role: user.role || 'USER',
        name: user.nom || user.name
      }));
    });
  }

  changeView(view: 'dashboard' | 'stats' | 'centres' | 'users'): void {
    this.currentView = view;
  }

  private loadAdminName(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          console.warn('No user data available from authService');
          this.adminName = 'Admin';
          return;
        }
        console.log('Current user:', user); // Debug the user object
        this.adminName = user.nom || (user.email && user.email.includes('@') ? user.email.split('@')[0] : 'Admin');
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.adminName = 'Admin';
      }
    });
  }

  private loadRealData(): void {
    const rawData = localStorage.getItem('appData');
    if (!rawData) {
      console.warn('Aucune donnée trouvée dans localStorage');
      return;
    }
    const appData: AppData = JSON.parse(rawData);

    this.requests = [...appData.requests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.quotes = [...appData.quotes].filter(quote => quote.status === 'pending');
    this.demandes = [...appData.demandes];

    const today = new Date().toISOString().split('T')[0];
    this.todayRequests = appData.requests.filter(req => req.date === today).length;
    this.pendingQuotes = appData.quotes.filter(quote => quote.status === 'pending').length;
    this.completedDemandes = appData.demandes.filter(demande => demande.status === 'completed').length;
  }

  logout(): void {
    this.authService.logout();
  }
}