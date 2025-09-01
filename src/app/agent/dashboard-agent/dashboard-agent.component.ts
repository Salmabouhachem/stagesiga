import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Centre } from 'src/app/model/centre.model';

/** ===== UI models ===== */
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
  natureClient?: 'PARTICULIER' | 'ENTREPRISE' | 'ADMINISTRATION' | 'AUTRE';
  usage?: 'DOMESTIQUE' | 'COMMERCIAL' | 'INDUSTRIEL' | 'AGRICOLE';
}

interface Devis {
  id: number;
  requestId: number;
  agentId: number | null;
  centerId: number | null;
  amount: number;
  date: string; // yyyy-MM-dd
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  description: string;
  currency: string;
  articlesBranchement?: string;
  diametreBranchement?: string;
  calibreCompteur?: string;
  clientId?: string;
  clientName?: string;
}

/** ===== DTOs (backend devis) ===== */
interface DevisRequestDTO {
  requestId: number;
  agentId: number | null;
  centerId: number | null;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  description: string;
  currency: string;
  articlesBranchement?: string;
  diametreBranchement?: string;
  calibreCompteur?: string;
  clientId?: string;
  clientName?: string;
}

interface DevisResponseDTO {
  id: number;
  requestId: number | null;
  agentId: number | null;
  centerId: number | null;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  description: string;
  currency: string;
  articlesBranchement?: string;
  diametreBranchement?: string;
  calibreCompteur?: string;
  clientId?: string;
  clientName?: string;
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

  currentSection: 'dashboard' | 'demandes' | 'devis' | 'demande-details' | 'quote-editor' = 'dashboard';
  agentName = '';
  agentId = '';
  currentCenter: Centre | null = null;
  agentCenters: Centre[] = [];
  currentCenterName: string | null = null;
  statusFilter: 'all' | 'new' | 'in-progress' | 'completed' = 'all';

  // Stats
  pendingRequests = 0;
  quotesToCreate = 0;
  completedRequests = 0;

  // Data
  allRequests: Request[] = [];
  filteredRequests: Request[] = [];
  recentRequests: Request[] = [];
  requestsForQuotes: Request[] = [];
  quotes: Devis[] = [];

  // Selection
  selectedRequest: Request | null = null;
  currentQuote: Devis = this.createEmptyQuote();
  isEditingQuote = false;

  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

ngOnInit(): void {
  // Charger l'utilisateur depuis le localStorage
  const currentUserStr = localStorage.getItem('currentUser');
  if (currentUserStr) {
    try {
      this.currentUser = JSON.parse(currentUserStr);

      const firstCentre = this.currentUser?.centres?.[0];

      if (typeof firstCentre === 'string') {
        // Cas: backend renvoie ["ariana"]
        this.currentCenterName = firstCentre;
        this.currentCenter = { id: 0, nom: firstCentre } as Centre;
      } else {
        // Cas: backend renvoie [{id: 1, nom: "Ariana"}]
        this.currentCenterName = firstCentre?.nom ?? null;
        this.currentCenter = firstCentre ?? null;
      }

    } catch (e) {
      console.error('Erreur parsing currentUser:', e);
      this.currentUser = null;
      this.currentCenterName = null;
      this.currentCenter = null;
    }
  }

  // Charger infos agent et données
  this.loadAgentInfo();
  this.loadAgentData();
}


  /** ===== Auth/User info ===== */
  loadAgentInfo(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.agentName = user?.name || user?.nom || 'Agent';
        this.agentId = (user?.id ?? this.currentUser?.id ?? '').toString();
        this.agentCenters = user?.centres || [];
        // si pas de currentCenterName déjà calculé, tentez ici
        if (!this.currentCenterName) {
          this.currentCenterName = this.agentCenters?.[0]?.nom ?? null;
          this.currentCenter = this.agentCenters?.[0] ?? null;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des infos agent', err);
        this.agentName = 'Agent';
        this.agentId = '';
      }
    });
  }

  /** ===== Mapping DemandeBranchement (backend) -> Request (UI) ===== */
  private mapStatusToOld(
    s: 'PENDING' | 'APPROVED' | 'REJECTED'
  ): 'new' | 'in-progress' | 'completed' {
    switch (s) {
      case 'PENDING':  return 'new';
      case 'APPROVED': return 'in-progress';
      case 'REJECTED': return 'completed';
      default:         return 'new';
    }
  }

  private mapOldToStatus(
    s: 'new' | 'in-progress' | 'completed'
  ): 'PENDING' | 'APPROVED' | 'REJECTED' {
    switch (s) {
      case 'new':         return 'PENDING';
      case 'in-progress': return 'APPROVED';
      case 'completed':   return 'REJECTED';
      default:            return 'PENDING';
    }
  }

  private mapBackendToRequest(d: any): Request {
    return {
      id: d.id,
      clientId: d.client ?? '',
      clientName: `${d?.nom ?? ''} ${d?.prenom ?? ''}`.trim(),
      clientEmail: d.email ?? '',
      clientPhone: d.telephone ?? '',
      centerId: d?.centre?.id ?? 0,
      date: d.date ?? '',
      status: this.mapStatusToOld(d.status),
      description: d.description ?? '',
      address: d.adresse ?? '',
      latitude: d.latitude != null ? String(d.latitude) : '',
      longitude: d.longitude != null ? String(d.longitude) : '',
      internalNotes: '',
      natureClient: d.natureClient,
      usage: d.usage
    };
  }

  /** ===== Mapping Request (UI) -> DemandeBranchement (backend) ===== */
  private mapRequestToBackend(r: Request): any {
    const [nom, ...rest] = (r.clientName || '').trim().split(' ');
    const prenom = rest.join(' ');
    const dateForBackend = r.date ? new Date(r.date).toISOString().slice(0, 10) : null;

    return {
      id: r.id,
      client: r.clientId || r.clientEmail || '',
      nom: nom || '',
      prenom: prenom || '',
      email: r.clientEmail || '',
      telephone: r.clientPhone || '',
      adresse: r.address || '',
      description: r.description || '',
      date: dateForBackend,
      status: this.mapOldToStatus(r.status),
      latitude: r.latitude !== '' ? Number(r.latitude) : null,
      longitude: r.longitude !== '' ? Number(r.longitude) : null,
      centre: r.centerId ? { id: r.centerId } : null,
      natureClient: r.natureClient ?? 'PARTICULIER',
      usage: r.usage ?? 'DOMESTIQUE'
    };
  }

  /** ===== Load data ===== */
  loadAgentData(): void {
    if (this.currentCenter && (this.currentCenter as any).id) {
      // Demandes par centre précis
      this.apiService.getDemandesByCentre((this.currentCenter as any).id).subscribe({
        next: (demandes) => {
          this.allRequests = (demandes || []).map(d => this.mapBackendToRequest(d));
          this.postLoad();
        },
        error: (err) => console.error('Erreur API centre:', err)
      });
    } else {
      // Demandes pour l’agent connecté (centres rattachés)
      this.apiService.getDemandesPourAgent().subscribe({
        next: (demandes) => {
          this.allRequests = (demandes || []).map(d => this.mapBackendToRequest(d));
          this.postLoad();
        },
        error: (err) => console.error('Erreur API agent:', err)
      });
    }

    // Charger les devis depuis le backend devis
if ((this.currentCenter as any)?.id) {
  // Devis par centre
  this.apiService.getDevisByCentre((this.currentCenter as any).id).subscribe({
    next: (list: DevisResponseDTO[]) => {
      this.quotes = (list || []).map(d => this.mapDevisResponseToUi(d));
    },
    error: (err) => console.error('Erreur chargement devis centre:', err)
  });
} else if (this.currentUser?.id) {
  // Devis par agent
  const agentId = Number(this.currentUser.id); // on s'assure que c'est un number
  this.apiService.getDevisByAgent(agentId).subscribe({
    next: (list: DevisResponseDTO[]) => {
      this.quotes = (list || []).map(d => this.mapDevisResponseToUi(d));
    },
    error: (err) => console.error('Erreur chargement devis agent:', err)
  });
} else {
  // Tous les devis (fallback)
  this.apiService.getAllDevis().subscribe({
    next: (list: DevisResponseDTO[]) => {
      this.quotes = (list || []).map(d => this.mapDevisResponseToUi(d));
    },
    error: (err) => console.error('Erreur chargement devis:', err)
  });
}}


  private postLoad(): void {
    this.filterRequests();
    this.updateStats();
    this.prepareRecentRequests();
    this.prepareRequestsForQuotes();
  }

  /** ===== Devis mapping ===== */
  private mapDevisResponseToUi(q: DevisResponseDTO): Devis {
    return {
      id: q.id ?? 0,
      requestId: q.requestId ?? 0,
      agentId: q.agentId ?? null,
      centerId: q.centerId ?? null,
      amount: Number(q.amount ?? 0),
      date: q.date ?? new Date().toISOString().slice(0, 10),
      status: (q.status as Devis['status']) ?? 'draft',
      description: q.description ?? '',
      currency: q.currency ?? 'TND',
      articlesBranchement: q.articlesBranchement ?? '',
      diametreBranchement: q.diametreBranchement ?? '',
      calibreCompteur: q.calibreCompteur ?? '',
      clientId: q.clientId ?? '',
      clientName: q.clientName ?? ''
    };
  }

  private toDevisRequestDTO(q: Devis): DevisRequestDTO {
    const selectedReq = this.allRequests.find(r => r.id === q.requestId);
    return {
      requestId: q.requestId,
      agentId: q.agentId ?? this.currentUser?.id ?? null,
      centerId: q.centerId ?? (this.currentCenter as any)?.id ?? null,
      amount: q.amount,
      date: q.date,
      status: q.status,
      description: q.description,
      currency: q.currency || 'TND',
      articlesBranchement: q.articlesBranchement,
      diametreBranchement: q.diametreBranchement,
      calibreCompteur: q.calibreCompteur,
      clientId: selectedReq?.clientId || '',
      clientName: selectedReq?.clientName || ''
    };
  }

  /** ===== Filters & stats ===== */
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
    this.pendingRequests = this.allRequests.filter(r => r.status === 'new').length;
    this.quotesToCreate = this.allRequests.filter(
      r => r.status === 'in-progress' && !this.quotes.some(q => q.requestId === r.id)
    ).length;
    this.completedRequests = this.allRequests.filter(r => r.status === 'completed').length;
  }

  prepareRecentRequests(): void {
    this.recentRequests = [...this.allRequests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  prepareRequestsForQuotes(): void {
    // Ex: tu veux les demandes "in-progress" comme candidates
    this.requestsForQuotes = this.allRequests.filter(r => r.status === 'in-progress');
  }

  /** ===== Actions demandes ===== */
  viewRequestDetails(request: Request): void {
    this.selectedRequest = { ...request };
    this.currentSection = 'demande-details';
  }

  startProcessingRequest(request: Request): void {
    request.status = 'in-progress';
    const payload = this.mapRequestToBackend(request);
    this.apiService.updateDemande(request.id, payload).subscribe({
      next: () => this.loadAgentData(),
      error: () => alert('Erreur lors de la mise à jour')
    });
  }

  updateRequestStatus(): void {
    if (!this.selectedRequest) return;
    const payload = this.mapRequestToBackend(this.selectedRequest);
    this.apiService.updateDemande(this.selectedRequest.id, payload).subscribe({
      next: () => {
        this.currentSection = 'demandes';
        this.loadAgentData();
      },
      error: () => alert('Erreur lors de la sauvegarde')
    });
  }

  /** ===== Devis ===== */
  createNewQuote(): void {
    this.currentQuote = this.createEmptyQuote();
    this.isEditingQuote = false;
    this.currentSection = 'quote-editor';
  }

  viewQuoteDetails(_quote: Devis): void {
    // Route vers une page de détails si besoin
  }

  editQuote(quote: Devis): void {
    this.currentQuote = { ...quote };
    this.isEditingQuote = true;
    this.currentSection = 'quote-editor';
  }

  saveQuote(): void {
    if (!this.currentQuote.requestId || !this.currentQuote.amount || !this.currentQuote.description) {
      alert('Veuillez remplir demande, montant et description.');
      return;
    }

    const dto = this.toDevisRequestDTO(this.currentQuote);

    if (this.isEditingQuote && this.currentQuote.id) {
      this.apiService.updateDevis(this.currentQuote.id, dto).subscribe({
        next: () => {
          alert('Devis mis à jour avec succès');
          this.currentSection = 'devis';
          this.loadAgentData();
        },
        error: () => alert('Erreur lors de la mise à jour du devis')
      });
    } else {
      this.apiService.createDevis(dto).subscribe({
        next: () => {
          alert('Devis créé avec succès');
          this.currentSection = 'devis';
          this.loadAgentData();
        },
        error: () => alert('Erreur lors de la création du devis')
      });
    }
  }

  cancelQuoteEdit(): void {
    this.currentSection = 'devis';
  }

  /** ===== Helpers ===== */
  createEmptyQuote(): Devis {
    return {
      id: 0,
      requestId: 0,
      agentId: this.currentUser?.id ?? null,
      centerId: (this.currentCenter as any)?.id ?? null,
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      status: 'draft',
      description: '',
      currency: 'TND',
      articlesBranchement: '',
      diametreBranchement: '',
      calibreCompteur: '',
      clientId: '',
      clientName: ''
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

  getQuoteStatusLabel(status: Devis['status']): string {
    switch (status) {
      case 'draft':    return 'Brouillon';
      case 'sent':     return 'Envoyé';
      case 'approved': return 'Accepté';
      case 'rejected': return 'Refusé';
      default:         return status;
    }
  }

  generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /** Legacy mocks kept for dev if you still need them */
  getAgentRequests(): Observable<Request[]> {
    return this.http.get<Request[]>('/api/requests');
  }
  getAgentQuotes(): Observable<Devis[]> {
    return this.http.get<Devis[]>('/api/quotes');
  }
  getClient(clientId: string): Observable<Client> {
    return this.http.get<Client>(`/api/clients/${clientId}`);
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
}
