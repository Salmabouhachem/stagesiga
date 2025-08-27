import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ClientService } from '../../services/client.service';
import { DataPersistenceService } from 'src/app/services/dataPersistence.service';


type DemandeStatus = 'new' | 'in-progress' | 'completed';
type QuoteStatus = 'pending' | 'approved' | 'rejected';
type RequestStatus = DemandeStatus | 'pending';

interface User {
  email: string;
  name: string;
  roles: string[];
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
  latitude: number;
  longitude: number;
  natureClient: 'PARTICULIER' | 'ENTREPRISE' | 'ADMINISTRATION' | 'AUTRE';
  usage: 'DOMESTIQUE' | 'COMMERCIAL' | 'INDUSTRIEL' | 'AGRICOLE';
}

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './dashboard-client.component.html',
  styleUrls: ['./dashboard-client.component.css']
})
export class ClientDashboardComponent implements OnInit {
  currentSection = 'dashboard';
  clientName = 'Chargement...';
  clientEmail = '';
  showRequestForm = false;
  
  // Statistiques
  activeRequests = 0;
  pendingQuotes = 0;
  completedRequests = 0;
  
  // Données
  myRequests: (Request | DemandeBranchement)[] = [];
  myQuotes: Quote[] = [];
  selectedDemande: DemandeBranchement | null = null;

  // Formulaire de demande
  demande: Omit<DemandeBranchement, 'id' | 'client' | 'date' | 'status'> = {
    description: '',
    nom: '',
    prenom: '',
    email: '',
    cin: '',
    telephone: '',
    adresse: '',
    latitude: 0,
    longitude: 0,
    natureClient: 'PARTICULIER',
    usage: 'DOMESTIQUE'
  };

  natureClientOptions = [
    { value: 'PARTICULIER', label: 'Particulier' },
    { value: 'ENTREPRISE', label: 'Entreprise' },
    { value: 'ADMINISTRATION', label: 'Administration' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  usageOptions = [
    { value: 'DOMESTIQUE', label: 'Domestique' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'INDUSTRIEL', label: 'Industriel' },
    { value: 'AGRICOLE', label: 'Agricole' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    private dataService: DataPersistenceService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadClientInfo();
    this.loadClientData();
    
    // Check if data exists in service before loading
    const cachedData = this.dataService.getClientData();
    if (cachedData) {
      this.useCachedData(cachedData);
    } else {
      this.loadClientData();
    }
    
    this.prefillClientInfo();
  }

  private useCachedData(data: any): void {
    this.myRequests = data.requests;
    this.myQuotes = data.quotes;
    this.updateStatistics();
  }

  // Méthodes pour gérer les demandes
  viewDemandeDetails(demande: Request | DemandeBranchement): void {
    if ('natureClient' in demande) {
      this.selectedDemande = { ...demande };
    } else {
      this.selectedDemande = {
        id: demande.id,
        client: demande.client,
        date: demande.date,
        status: 'new',
        description: demande.description,
        nom: this.clientName.split(' ')[0] || '',
        prenom: this.clientName.split(' ')[1] || '',
        email: this.clientEmail,
        cin: '',
        telephone: '',
        adresse: '',
        latitude: 0,
        longitude: 0,
        natureClient: 'PARTICULIER',
        usage: 'DOMESTIQUE'
      };
    }
    this.currentSection = 'demande-details';
  }

  async updateClientInfo(): Promise<void> {
    if (!this.selectedDemande) return;

    if (!this.validateDemande(this.selectedDemande)) {
      return;
    }

    try {
      await lastValueFrom(
        this.http.put(`http://localhost:8080/api/demandes/interventions/${this.selectedDemande.id}`, this.selectedDemande)
      );
      
      // Clear cache to force reload
      this.dataService.clearClientData();
      await this.loadClientData();
      
      this.currentSection = 'mes-demandes';
      this.showSuccessAlert('Informations mises à jour');
    } catch (error) {
      this.handleError(error, 'Erreur lors de la mise à jour');
    }
  }
  async getCurrentPosition(): Promise<void> {
    try {
      const position = await this.getGeolocation();
      this.demande.latitude = position.coords.latitude;
      this.demande.longitude = position.coords.longitude;
    } catch (error) {
      this.handleError(error, 'Géolocalisation');
    }
  }

  private getGeolocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  private async loadClientInfo(): Promise<void> {
    try {
      const user = await lastValueFrom(this.authService.getCurrentUser());
      console.log('User data received:', user); // Debug the received user object

      if (user) {
        this.clientEmail = user.email || '';
        this.clientName = user.name || user.nom || user.email.split('@')[0] || 'Client'; // Fallback to email username
        this.demande.email = this.clientEmail;

        console.log('Client initialized:', {
          name: this.clientName,
          email: this.clientEmail
        });
      } else {
        this.clientName = 'Client';
      }
      this.cdr.detectChanges(); // Manually trigger change detection
    } catch (error) {
      console.error('Failed to load user info:', error);
      this.clientName = 'Client';
      this.cdr.detectChanges(); // Trigger change detection on error too
    }
  }
  private prefillClientInfo(): void {
    const nameParts = this.clientName.split(' ');
    this.demande.nom = nameParts[0] || '';
    this.demande.prenom = nameParts.slice(1).join(' ') || '';
  }

 private async loadClientData(): Promise<void> {
    try {
      console.log('Loading client data from API...');
      const [requests, quotes, demandes] = await Promise.all([
        lastValueFrom(this.http.get<Request[]>('http://localhost:8080/api/requests')),
        lastValueFrom(this.http.get<Quote[]>('http://localhost:8080/api/quotes')),
        lastValueFrom(this.http.get<DemandeBranchement[]>('http://localhost:8080/api/demandes/interventions'))
      ]);

      this.myRequests = [...requests, ...demandes]
        .filter(req => req.client === this.clientEmail)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      this.myQuotes = quotes.filter(quote => quote.client === this.clientEmail);

      // Store data in service with client email for validation
      this.dataService.setClientData({
        clientEmail: this.clientEmail,
        requests: this.myRequests,
        quotes: this.myQuotes
      });

      this.updateStatistics();
      console.log('Data loaded successfully', this.myRequests.length, 'requests', this.myQuotes.length, 'quotes');
    } catch (error) {
      console.error('Error loading client data:', error);
      this.handleError(error, 'Chargement des données');
      
      // If API fails, try to use cached data as fallback
      const cachedData = this.dataService.getClientData();
      if (cachedData) {
        this.useCachedData(cachedData);
      }
    }
  }

  private updateStatistics(): void {
    this.activeRequests = this.myRequests
      .filter(req => req.status !== 'completed').length;
      
    this.pendingQuotes = this.myQuotes
      .filter(quote => quote.status === 'pending').length;
      
    this.completedRequests = this.myRequests
      .filter(req => req.status === 'completed').length;
  }

  async submitDemande(): Promise<void> {
    if (!this.validateDemande(this.demande)) {
      return;
    }

    try {
      const demandeToSend = {
        ...this.demande,
        client: this.clientEmail,
        date: new Date().toISOString(),
        status: 'PENDING', 
        natureClient: this.demande.natureClient.toUpperCase(), 
        usage: this.demande.usage.toUpperCase()
      };

      await lastValueFrom(this.clientService.submitIntervention(demandeToSend));

      // Clear cache to force reload
      this.dataService.clearClientData();
      await this.loadClientData();
      
      this.showSuccessAlert('Demande envoyée avec succès');
      this.resetDemandeForm();
    } catch (error) {
      this.handleError(error, 'Envoi de demande');
    }
  }

  private validateDemande(demande: any): boolean {
    const requiredFields = ['nom', 'prenom', 'email', 'cin', 'telephone', 'adresse'];
    for (const field of requiredFields) {
      if (!demande[field]) {
        this.showErrorAlert(`Le champ ${field} est obligatoire`);
        return false;
      }
    }
    return true;
  }

   resetDemandeForm(): void {
    this.demande = {
      description: '',
      nom: '',
      prenom: '',
      email: this.clientEmail,
      cin: '',
      telephone: '',
      adresse: '',
      latitude: 0,
      longitude: 0,
      natureClient: 'PARTICULIER',
      usage: 'DOMESTIQUE'
    };
  }

  // Méthodes utilitaires
  getStatusInfo(status: string): { label: string, class: string } {
    const statusMap: Record<string, { label: string, class: string }> = {
      'new': { label: 'Nouvelle', class: 'badge-primary' },
      'in-progress': { label: 'En cours', class: 'badge-warning' },
      'completed': { label: 'Terminée', class: 'badge-success' },
      'pending': { label: 'En attente', class: 'badge-info' },
      'approved': { label: 'Approuvé', class: 'badge-success' },
      'rejected': { label: 'Rejeté', class: 'badge-danger' }
    };

    return statusMap[status] || { label: status, class: 'badge-secondary' };
  }

  getNatureClientLabel(value: string): string {
    return this.natureClientOptions.find(opt => opt.value === value)?.label || value;
  }

  getUsageLabel(value: string): string {
    return this.usageOptions.find(opt => opt.value === value)?.label || value;
  }

  private showSuccessAlert(message: string): void {
    alert(`Succès: ${message}`);
  }

  private showErrorAlert(message: string): void {
    alert(`Erreur: ${message}`);
  }

  private handleError(error: any, context: string): void {
    console.error(`[${context}]`, error);
    this.showErrorAlert(`${context}: ${error.message || 'Erreur inconnue'}`);
  }

  logout(): void {
  this.authService.logout().subscribe({
    next: () => this.router.navigate(['/login']),
    error: (err: HttpErrorResponse) => this.handleError(err, 'Déconnexion')
  });
}
  // Dans ClientDashboardComponent
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

getCurrentPositionForSelected(): void {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (this.selectedDemande) {
          this.selectedDemande.latitude = position.coords.latitude;
          this.selectedDemande.longitude = position.coords.longitude;
        }
      },
      (error) => console.error('Erreur de géolocalisation', error)
    );
  }
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
  // Implémentez la logique de mise à jour ici
}
}