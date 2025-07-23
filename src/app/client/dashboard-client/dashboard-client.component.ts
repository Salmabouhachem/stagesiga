import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  clientEmail: string | null = '';
  clientRoles: string[] = [];

  ngOnInit(): void {
    this.clientEmail = localStorage.getItem('email');
    const roles = localStorage.getItem('roles');
    if (roles) {
      this.clientRoles = JSON.parse(roles);
    }
  }
}
