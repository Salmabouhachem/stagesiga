import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  agentEmail: string | null = '';
  agentRoles: string[] = [];

  ngOnInit(): void {
    this.agentEmail = localStorage.getItem('email');
    const roles = localStorage.getItem('roles');
    if (roles) {
      this.agentRoles = JSON.parse(roles);
    }
  }
}
