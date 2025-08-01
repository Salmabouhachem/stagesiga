import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
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
  currentView: 'stats' | 'centres' | 'users' = 'stats';
  currentSection = 'dashboard';
  adminName = '';
  authService: any;
  constructor(private adminService: AdminService) {}
activeTab: 'centres' | 'users' = 'centres';

navigateTo(tab: 'centres' | 'users'): void {
  this.activeTab = tab;
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

  // Remplacez la méthode loadUsers()
loadUsers(): void {
  this.adminService.getUsers().subscribe(apiUsers => {
    this.users = apiUsers.map(user => ({
      ...user,
      // Normalise les champs
      nom: user.nom || user.name || '',
      prenom: user.prenom || '',
      role: user.role || 'USER',
      // Garde la compatibilité
      name: user.nom || user.name // Optionnel
    }));
  });
}
  changeView(view: 'stats' | 'centres' | 'users'): void {
    this.currentView = view;
  }


  // Données réelles
  activeUsers = 0;
  todayRequests = 0;
  pendingQuotes = 0;
  newDemandes = 0;
  
  requests: Request[] = [];
  quotes: Quote[] = [];
  demandes: DemandeBranchement[] = []; // Ajoutez cette ligne
  clients: User[] = [];



  ngOnInit(): void {
    this.initAppData();
    this.loadAdminName();
    this.loadRealData();
  }
  selectedDemande: DemandeBranchement | null = null;
viewDemandeDetails(demande: DemandeBranchement): void {
  this.selectedDemande = demande;
  this.currentSection = 'demande-details';
}

 private initAppData(): void {
  if (!this.getAppData()) {
    const initialData: AppData = {
      users: {
        'admin@example.com': {
          email: 'admin@example.com',
          nom: 'Administrateur', // Maintenant compatible
          prenom: '',
          role: 'ADMIN',
          active: true,
          // Garde la compatibilité
          name: 'Administrateur'
        }
      },
      requests: [],
      quotes: [],
      demandes: []
    };
    this.saveAppData(initialData);
  }
}
  getNatureClientLabel(value: string): string {
  const options = [
    { value: 'particulier', label: 'Particulier' },
    { value: 'entreprise', label: 'Entreprise' },
    { value: 'administration', label: 'Administration' },
    { value: 'autre', label: 'Autre' }
  ];
  return options.find(opt => opt.value === value)?.label || value;
}

getUsageLabel(value: string): string {
  const options = [
    { value: 'domestique', label: 'Domestique' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industriel', label: 'Industriel' },
    { value: 'agricole', label: 'Agricole' }
  ];
  return options.find(opt => opt.value === value)?.label || value;
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
  const rawData = localStorage.getItem('appData');
  if (!rawData) {
    console.warn('Aucune donnée trouvée dans localStorage');
    return;
  }
  const appData: AppData = JSON.parse(rawData);
   if (!appData.demandes) {
    appData.demandes = [];
    this.saveAppData(appData);
  }

  // Debug: Vérifiez les données reçues
  console.log('Données chargées:', {
    demandes: appData.demandes,
    users: appData.users
  });

  // Filtrage des clients actifs
  this.clients = Object.values(appData.users).filter(user => user.active);
  
  // Chargement des demandes
  this.demandes = appData.demandes;
  
  // Statistiques
  this.newDemandes = this.demandes.filter(d => d.status === 'new').length;
  this.activeUsers = this.clients.length;

    // Statistiques
    this.activeUsers = Object.values(appData.users)
      .filter(user => user.active).length;
    
    const today = new Date().toISOString().split('T')[0];
    this.todayRequests = appData.requests
      .filter(req => req.date === today).length;
    
    this.pendingQuotes = appData.quotes
      .filter(quote => quote.status === 'pending').length;
    this.newDemandes = appData.demandes // Ajoutez cette ligne
      .filter(demande => demande.status === 'new').length;
    
    // Données pour les listes
    this.requests = [...appData.requests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    this.quotes = [...appData.quotes]
      .filter(quote => quote.status === 'pending');
    this.demandes = [...appData.demandes]; // Ajoutez cette ligne
    this.clients = Object.values(appData.users) // Ajoutez cette ligne
      .filter(user => user.active);
  }
  updateDemandeStatus(demandeId: number, status: 'new' | 'in-progress' | 'completed'): void {
    const appData = this.getAppData();
    if (!appData?.demandes) return;

    appData.demandes = appData.demandes.map(d => 
      d.id === demandeId ? { ...d, status } : d
    );

    this.saveAppData(appData);
    this.loadRealData();
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
  checkStorageConsistency(): void {
  const clientData = JSON.parse(localStorage.getItem('appData') || '{}');
  console.log('Données dans localStorage:', {
    demandes: clientData.demandes,
    lastUpdated: new Date(clientData.lastUpdated || 0)
  });
}
}