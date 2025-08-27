import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Centre } from 'src/app/model/centre.model';

interface Request {
  id: number;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  centerId: number;
  date: string;
  status: 'new' | 'in-progress' | 'completed';
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  internalNotes: string;
}

interface Quote {
  id: number;
  requestId: number;
  clientId: string;
  clientName: string;
  agentId: string;
  centerId: number;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  description: string;
  currency: string;

  // Champs spécifiques devis branchement
  articlesBranchement?: string;
  diametreBranchement?: string;
  calibreCompteur?: string;
}
interface Center {
  id: number;
  name: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cin: string;
}

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './dashboard-agent.component.html',
  styleUrls: ['./dashboard-agent.component.css']
})
export class AgentDashboardComponent implements OnInit {
  currentSection = 'dashboard';
  agentName = '';
  agentId = '';
  currentCenter: Centre | null = null;
  agentCenters:  Centre[] = [];
  statusFilter = 'all';

  // Statistiques
  pendingRequests = 0;
  quotesToCreate = 0;
  completedRequests = 0;

  // Données
  allRequests: Request[] = [];
  filteredRequests: Request[] = [];
  recentRequests: Request[] = [];
  quotes: Quote[] = [];
  requestsForQuotes: Request[] = [];

  // Sélection
  selectedRequest: Request | null = null;
  currentQuote: Quote = this.createEmptyQuote();
  isEditingQuote = false;
   currentCenterName = null;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
     private apiService: ApiService
  ) {}

  ngOnInit(): void {
  const currentUserStr = localStorage.getItem("currentUser");

  if (currentUserStr) {
    try {
      this.currentUser = JSON.parse(currentUserStr);
      this.currentCenterName = this.currentUser?.centres[0] || null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.currentCenterName = null;
    }
  }
    this.loadAgentInfo();
    this.loadAgentData();
  }

loadAgentInfo(): void {
  this.authService.getCurrentUser().subscribe({
    next: (user) => {
      this.agentName = user?.name || 'Agent';
      this.agentId = this.currentUser?.id || '';
    this.agentCenters = user?.centres || [];    },
    error: (err) => {
      console.error('Erreur lors du chargement des infos agent', err);
      this.agentName = 'Agent';
      this.agentId = '';
    }
  });
}

  loadAgentData(): void {
  this.apiService.getAgentRequests(this.agentId).subscribe({
    next: (requests: Request[]) => {
      this.allRequests = requests;
      this.filterRequests();
      this.updateStats();
      this.prepareRecentRequests();
      this.prepareRequestsForQuotes();
    },
    error: (err) => {
      console.error('Erreur API:', err);
      alert('Erreur lors du chargement des demandes. Veuillez réessayer.');
    
    }
  });

  this.apiService.getAgentQuotes(this.agentId).subscribe({
    next: (quotes: Quote[]) => {
      this.quotes = quotes;
    },
    error: (err: any) => {
      console.error('Erreur API:', err);
      // Gérer l'erreur sans bloquer l'application
    }
  });
}


  getAgentRequests(): Observable<Request[]> {
    // Simuler un appel API
    return this.http.get<Request[]>('/api/requests');
  }

  getAgentQuotes(): Observable<Quote[]> {
    // Simuler un appel API
    return this.http.get<Quote[]>('/api/quotes');
  }

  getClient(clientId: string): Observable<Client> {
    return this.http.get<Client>(`/api/clients/${clientId}`);
  }

  filterRequests(): void {
    if (this.statusFilter === 'all') {
      this.filteredRequests = [...this.allRequests];
    } else {
      this.filteredRequests = this.allRequests.filter(
        req => req.status === this.statusFilter
      );
    }
  }

  updateStats(): void {
    this.pendingRequests = this.allRequests.filter(
      req => req.status === 'new'
    ).length;
    
    this.quotesToCreate = this.allRequests.filter(
      req => req.status === 'in-progress' && 
      !this.quotes.some(q => q.requestId === req.id)
    ).length;
    
    this.completedRequests = this.allRequests.filter(
      req => req.status === 'completed'
    ).length;
  }

  prepareRecentRequests(): void {
    this.recentRequests = [...this.allRequests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  prepareRequestsForQuotes(): void {
    this.requestsForQuotes = this.allRequests.filter(
      req => req.status === 'in-progress'
    );
  }

  viewRequestDetails(request: Request): void {
    this.selectedRequest = { ...request };
    this.currentSection = 'demande-details';
  }

  startProcessingRequest(request: Request): void {
    request.status = 'in-progress';
    this.updateStats();
    // Sauvegarder le changement
    this.updateRequest(request).subscribe(
      () => this.loadAgentData(),
      error => alert('Erreur lors de la mise à jour')
    );
  }

  updateRequest(request: Request): Observable<Request> {
    return this.http.put<Request>(`/api/requests/${request.id}`, request);
  }

  updateRequestStatus(): void {
    if (!this.selectedRequest) return;
    
    this.updateRequest(this.selectedRequest).subscribe(
      () => {
        this.currentSection = 'demandes';
        this.loadAgentData();
      },
      error => alert('Erreur lors de la sauvegarde')
    );
  }

  createNewQuote(): void {
    this.currentQuote = this.createEmptyQuote();
    this.isEditingQuote = false;
    this.currentSection = 'quote-editor';
  }

  viewQuoteDetails(quote: Quote): void {
    // Navigation vers une page de détails si nécessaire
  }

  editQuote(quote: Quote): void {
    this.currentQuote = { ...quote };
    this.isEditingQuote = true;
    this.currentSection = 'quote-editor';
  }

  saveQuote(): void {
  if (
    !this.currentQuote.requestId ||
    !this.currentQuote.articlesBranchement ||
    !this.currentQuote.diametreBranchement ||
    !this.currentQuote.calibreCompteur ||
    this.currentQuote.amount <= 0
  ) {
    alert('Veuillez remplir tous les champs obligatoires du devis.');
    return;
  }

    const request = this.allRequests.find(r => r.id === this.currentQuote.requestId);
    if (!request) {
      alert('Demande introuvable');
      return;
    }

    // Préparation des données
    const quoteData: Quote = {
      ...this.currentQuote,
      clientId: request.clientId,
      clientName: request.clientName,
      currency: 'TND' // Toujours en dinars tunisiens
    };

    if (this.isEditingQuote) {
      this.updateQuote(quoteData).subscribe(
        () => {
          alert('Devis mis à jour avec succès');
          this.currentSection = 'devis';
          this.loadAgentData();
        },
        error => alert('Erreur lors de la mise à jour')
      );
    } else {
      this.createQuote(quoteData).subscribe(
        () => {
          alert('Devis créé avec succès');
          this.currentSection = 'devis';
          this.loadAgentData();
        },
        error => alert('Erreur lors de la création')
      );
    }
  }

  createQuote(quote: Quote): Observable<Quote> {
    return this.http.post<Quote>('/api/quotes', quote);
  }

  updateQuote(quote: Quote): Observable<Quote> {
    return this.http.put<Quote>(`/api/quotes/${quote.id}`, quote);
  }

  cancelQuoteEdit(): void {
    this.currentSection = 'devis';
  }

  createEmptyQuote(): Quote {
  return {
    id: 0,
    requestId: 0,
    clientId: '',
    clientName: '',
    agentId: this.agentId,
    centerId: this.currentCenter?.id || 0,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    description: '',
    currency: 'TND',
    articlesBranchement: '',
    diametreBranchement: '',
    calibreCompteur: ''
  };
}


  getStatusLabel(status: string): string {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminée';
      default: return status;
    }
  }

  getQuoteStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'approved': return 'Accepté';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  }

  generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  logout(): void {
    this.authService.logout();
  }
}