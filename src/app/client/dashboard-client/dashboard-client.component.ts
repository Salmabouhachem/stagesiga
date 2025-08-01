import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

type DemandeStatus = 'new' | 'in-progress' | 'completed';
type QuoteStatus = 'pending' | 'approved' | 'rejected';
type RequestStatus = DemandeStatus | 'pending';

interface User {
  email: string;
  name: string;
  active: boolean;
}

interface Request {
  id: number;
  client: string;
  date: string;
  status: RequestStatus;
  description: string;
}

interface Quote {
  id: number;
  client: string;
  date: string;
  status: QuoteStatus;
  amount: number;
  description: string;
}

interface DemandeBranchement {
  id: number;
  client: string;
  date: string;
  status: DemandeStatus;
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

interface AppData {
  users: { [email: string]: User };
  requests: Request[];
  quotes: Quote[];
  demandes: DemandeBranchement[];
}

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './dashboard-client.component.html',
  styleUrls: ['./dashboard-client.component.css']
})
export class ClientDashboardComponent implements OnInit {
  currentSection = 'dashboard';
  clientName = '';
  newRequestDescription = '';
  showRequestForm = false;
  
  // Statistiques
  activeRequests = 0;
  pendingQuotes = 0;
  completedRequests = 0;
  
  // Données
  myRequests: (Request | DemandeBranchement)[] = [];
  myQuotes: Quote[] = [];
  clientEmail = '';
  selectedDemande: DemandeBranchement | null = null;
  originalDemande: DemandeBranchement | null = null;

  // Formulaire de demande
  demande: DemandeBranchement = {
    id: 0,
    client: '',
    date: '',
    status: 'new',
    description: '',
    nom: '',
    email: '',
    cin: '',
    telephone: '',
    adresse: '',
    latitude: '',
    longitude: '',
    natureClient: 'particulier',
    usage: 'domestique',
    prenom: ''
  };

  natureClientOptions = [
    { value: 'particulier', label: 'Particulier' },
    { value: 'entreprise', label: 'Entreprise' },
    { value: 'administration', label: 'Administration' },
    { value: 'autre', label: 'Autre' }
  ];

  usageOptions = [
    { value: 'domestique', label: 'Domestique' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industriel', label: 'Industriel' },
    { value: 'agricole', label: 'Agricole' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initClientData();
    this.loadClientInfo();
    this.loadClientData();
    this.prefillClientInfo();
  }

  // Méthodes pour gérer les demandes
  viewDemandeDetails(demande: Request | DemandeBranchement): void {
    if ('natureClient' in demande) {
      // C'est une DemandeBranchement
      this.selectedDemande = { ...demande };
      this.originalDemande = { ...demande };
    } else {
      // C'est une Request - conversion en DemandeBranchement
      this.selectedDemande = {
        id: demande.id,
        client: demande.client,
        date: demande.date,
        status: demande.status as DemandeStatus,
        description: demande.description,
        nom: this.clientName.split(' ')[0] || '',
        prenom: this.clientName.split(' ')[1] || '',
        email: this.clientEmail,
        cin: '',
        telephone: '',
        adresse: '',
        latitude: '',
        longitude: '',
        natureClient: 'particulier',
        usage: 'domestique'
      };
      this.originalDemande = { ...this.selectedDemande };
    }
    this.currentSection = 'demande-details';
  }

  async updateClientInfo(): Promise<void> {
    if (!this.selectedDemande) return;

    // Validation des champs obligatoires
    const requiredFields: (keyof DemandeBranchement)[] = [
      'nom', 'prenom', 'email', 'cin', 'telephone', 
      'adresse', 'latitude', 'longitude', 'natureClient', 'usage'
    ];

    for (const field of requiredFields) {
      if (!this.selectedDemande[field]) {
        alert(`Le champ ${field} est obligatoire`);
        return;
      }
    }

    // Confirmation
    const confirmed = confirm('Êtes-vous sûr de vouloir modifier toutes les informations de ce client?');
    if (!confirmed) return;

    // Mise à jour des données
    const appData = this.getAppData();
    if (!appData) return;

    // Mettre à jour la demande
    appData.demandes = appData.demandes.map(d => 
      d.id === this.selectedDemande?.id ? this.selectedDemande : d
    );

    // Mettre à jour dans requests (si c'est une request)
    appData.requests = appData.requests.map(r => 
      r.id === this.selectedDemande?.id ? { 
        ...r,
        client: this.selectedDemande.email,
        description: `Demande de ${this.selectedDemande.nom} ${this.selectedDemande.prenom}`
      } : r
    );

    this.saveAppData(appData);
    this.loadClientData();
    this.currentSection = 'mes-demandes';
    alert('Informations client mises à jour avec succès');
  }

  getCurrentPosition(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.demande.latitude = position.coords.latitude.toString();
          this.demande.longitude = position.coords.longitude.toString();
        },
        (error) => {
          console.error('Erreur de géolocalisation', error);
          alert('Impossible d\'obtenir votre position. Veuillez entrer manuellement les coordonnées.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  }

  getCurrentPositionForSelected(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.selectedDemande) {
            this.selectedDemande.latitude = position.coords.latitude.toString();
            this.selectedDemande.longitude = position.coords.longitude.toString();
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation', error);
          alert('Impossible d\'obtenir votre position. Veuillez entrer manuellement les coordonnées.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  }

  private initClientData(): void {
    if (!this.getAppData()) {
      const initialData: AppData = {
        users: {},
        requests: [],
        quotes: [],
        demandes: []
      };
      this.saveAppData(initialData);
    }
  }

  private loadClientInfo(): void {
    const user = this.authService.getCurrentUser();
    this.clientEmail = user?.email || '';
    this.clientName = user?.name || user?.email?.split('@')[0] || 'Client';
  }

  private prefillClientInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.demande.email = user.email || '';
      this.demande.nom = user.name || user.email?.split('@')[0] || '';
    }
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

  private loadClientData(): void {
    const appData = this.getAppData();
    if (!appData) return;

    if (!appData.demandes) {
      appData.demandes = [];
      this.saveAppData(appData);
    }

    this.myRequests = [...appData.requests, ...appData.demandes]
      .filter(req => req.client === this.clientEmail)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.myQuotes = appData.quotes
      .filter(quote => quote.client === this.clientEmail);

    this.activeRequests = this.myRequests
      .filter(req => req.status !== 'completed').length;
      
    this.pendingQuotes = this.myQuotes
      .filter(quote => quote.status === 'pending').length;
      
    this.completedRequests = this.myRequests
      .filter(req => req.status === 'completed').length;
  }

  submitDemande(): void {
    if (!this.validateDemande()) {
      return;
    }

    const appData = this.getAppData();
    if (!appData) return;

    this.demande.id = this.generateId();
    this.demande.client = this.clientEmail;
    this.demande.date = new Date().toISOString().split('T')[0];
    this.demande.status = 'new';

    appData.demandes.push({...this.demande});
    this.saveAppData(appData);
    
    this.loadClientData();
    this.currentSection = 'dashboard';
    this.resetDemandeForm();
  }

  private validateDemande(): boolean {
    const requiredFields = ['nom','prenom', 'email', 'cin', 'telephone', 'adresse', 'latitude', 'longitude'];
    for (const field of requiredFields) {
      if (!this.demande[field as keyof DemandeBranchement]) {
        alert(`Le champ ${field} est obligatoire`);
        return false;
      }
    }
    return true;
  }

  resetDemandeForm(): void {
    this.demande = {
      id: 0,
      client: '',
      date: '',
      status: 'new',
      description: '',
      nom: '',
      prenom: '',
      email: this.clientEmail,
      cin: '',
      telephone: '',
      adresse: '',
      latitude: '',
      longitude: '',
      natureClient: 'particulier',
      usage: 'domestique'
    };
  }

  createNewRequest(): void {
    if (!this.newRequestDescription.trim()) return;

    const appData = this.getAppData();
    if (!appData) return;

    const newRequest: Request = {
      id: this.generateId(),
      client: this.clientEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'new',
      description: this.newRequestDescription
    };

    appData.requests.push(newRequest);
    this.saveAppData(appData);
    this.newRequestDescription = '';
    this.showRequestForm = false;
    this.loadClientData();
  }

  viewQuote(quoteId: number): void {
    this.router.navigate(['/quotes', quoteId]);
  }

  approveQuote(quoteId: number): void {
    this.updateQuoteStatus(quoteId, 'approved');
  }

  rejectQuote(quoteId: number): void {
    this.updateQuoteStatus(quoteId, 'rejected');
  }

  private updateQuoteStatus(quoteId: number, status: 'approved' | 'rejected'): void {
    const appData = this.getAppData();
    if (!appData) return;

    appData.quotes = appData.quotes.map(quote => 
      quote.id === quoteId ? { ...quote, status } : quote
    );

    this.saveAppData(appData);
    this.loadClientData();
  }

  // Méthodes utilitaires
  getStatusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  }

  getNatureClientLabel(value: string): string {
    const option = this.natureClientOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getUsageLabel(value: string): string {
    const option = this.usageOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'new': return 'badge-primary';
      case 'in-progress': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-info';
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  toggleRequestForm(): void {
    this.showRequestForm = !this.showRequestForm;
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  logout(): void {
    this.authService.logout();
  }
}