import { Component, Input, OnInit } from '@angular/core';
import { CentreService, Centre } from '../../services/center.service';
import { UserService } from '../../services/user.service'; // Assure-toi que ce service existe
import { User } from '../../model/user.model'; // Assure-toi que le modèle est défini

@Component({
  selector: 'app-centres-list',
  templateUrl: './centres-list.component.html'
})
export class CentresListComponent implements OnInit {
 @Input() centres: Centre[] = [];
  agents: User[] = [];
  selectedAgentMap: { [centreId: number]: number } = {};
  message = '';

  constructor(private centreService: CentreService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadCentres();
    this.loadAgents();
  }

  loadCentres() {
    this.centreService.getAllCentres().subscribe(data => this.centres = data);
  }

  loadAgents() {
    this.userService.getAllAgents().subscribe(data => this.agents = data);
  }

  affecterAgent(centreId: number) {
    const agentId = this.selectedAgentMap[centreId];
    if (agentId) {
      this.centreService.affecterUserToCentre(centreId, agentId).subscribe({
        next: () => this.message = `Agent affecté avec succès au centre ${centreId}`,
        error: err => this.message = `Erreur: ${err.error.message}`
      });
    }
  }
}
