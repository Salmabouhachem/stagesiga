import { Component, Input, OnInit } from '@angular/core';
import { CentreService, Centre } from '../../services/center.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../model/user.model';
import { AuthService } from '../../services/auth.service'; // Add this

@Component({
  selector: 'app-centres-list',
  templateUrl: './centres-list.component.html'
})
export class CentresListComponent implements OnInit {
  @Input() centres: Centre[] = [];
  agents: User[] = [];
  selectedAgentMap: { [centreId: number]: number } = {};
  message = '';

  constructor(
    private centreService: CentreService,
    private apiService: ApiService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadCentres();
    this.loadAgents();
    this.logCurrentRole(); // Log the current user's role
  }
loadCentres() {
  this.centreService.getAllCentres().subscribe({
    next: (data) => {
      this.centres = data;
      console.log('Centres loaded:', data);
    },
    error: (err) => {
      this.message = `Erreur lors du chargement des centres: ${err.message}`;
      console.error(err);
    }
  });
}

loadAgents() {
  this.apiService.getUsers().subscribe({
    next: (data) => {
      this.agents = data; // No need to filter by role if /agents is used
      console.log('Agents loaded:', this.agents);
      if (this.agents.length === 0) {
        this.message = 'Aucun agent trouvé.';
      }
    },
    error: (err) => {
      this.message = `Erreur lors du chargement des agents: Code ${err.status} - ${err.message}. Vérifiez vos permissions.`;
      console.error('Agent load error:', err);
    }
  });
}

  affecterAgent(centreId: number) {
    const agentId = this.selectedAgentMap[centreId];
    if (agentId) {
      this.centreService.affecterUserToCentre(centreId, agentId).subscribe({
        next: () => {
          this.message = `Agent affecté avec succès au centre ${centreId}`;
          this.loadCentres();
        },
        error: (err) => this.message = `Erreur: ${err.error?.message || err.message}`
      });
    } else {
      this.message = 'Veuillez sélectionner un agent.';
    }
  }

  private logCurrentRole() {
    this.authService.getCurrentUserRole().subscribe(role => {
      console.log('Current user role:', role);
    });
  }
}