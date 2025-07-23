import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AdminDashboardComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { ClientDashboardComponent } from './client/dashboard-client/dashboard-client.component';
import { HomeComponent } from './home/home.component';
import { AgentDashboardComponent } from './agent/dashboard-agent/dashboard-agent.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'agent-dashboard', component: AgentDashboardComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'home', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
