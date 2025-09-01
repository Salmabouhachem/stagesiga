import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { User } from '../../model/user.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  client: string;           // fallback
  clientName?: string;      // pour compatibilité avec backend
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  amount: number;           // ajouté
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
  currentView: 'dashboard' | 'stats' | 'centres' | 'users' | 'demandes' | 'devis' = 'dashboard';
  adminName = '';
  requests: Request[] = [];
  quotes: Quote[] = [];
  demandes: DemandeBranchement[] = [];
  todayRequests = 0;
  pendingQuotes = 0;
  completedDemandes = 0;
  router: any;

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAdminName();
    this.loadRealData();
    this.loadStats();
    this.loadCentres();
    this.loadUsers();
  }
  selectedDemande: DemandeBranchement | null = null;
  selectedQuote: any = null;


  viewQuote(quote: any): void {
  this.selectedQuote = quote;
}

closeQuoteDetails(): void {
  this.selectedQuote = null;
}


selectDemande(demande: DemandeBranchement): void {
  this.selectedDemande = demande;
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

  changeView(view: 'dashboard' | 'stats' | 'centres' | 'users' | 'demandes' | 'devis'): void {
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
  // Charger toutes les demandes
  this.adminService.getAllDemandes().subscribe({
    next: (demandes) => {
      this.demandes = demandes;
      this.completedDemandes = this.demandes.filter(d => d.status === 'completed').length;
    },
    error: (err) => console.error('Erreur chargement demandes', err)
  });

  // Charger tous les devis
  this.adminService.getAllDevis().subscribe({
    next: (quotes) => {
      this.quotes = quotes;
      this.pendingQuotes = this.quotes.filter(q => q.status === 'pending').length;
    },
    error: (err) => console.error('Erreur chargement devis', err)
  });
}



   logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err: HttpErrorResponse) => this.handleError(err, 'Déconnexion')
    });
  }
  handleError(err: HttpErrorResponse, arg1: string): void {
    throw new Error('Method not implemented.');
  }
  viewDemande(demande: DemandeBranchement): void {
  console.log("Voir demande :", demande);
  alert(`Détails de la demande #${demande.id}\nClient: ${demande.nom} ${demande.prenom}`);
  // 👉 Tu peux ouvrir un modal ou une page détails ici
}



}