import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AdminDashboardComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import{ClientDashboardComponent} from'./client/dashboard-client/dashboard-client.component';
import { AgentDashboardComponent } from './agent/dashboard-agent/dashboard-agent.component';
import { UsersListComponent } from './admin/users/users-list.component';
import { CentresListComponent  } from './admin/centres/centres-list.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'centres', component: CentresListComponent }, // Version statique
      { path: 'users', component: UsersListComponent },
      { path: '', redirectTo: 'centres', pathMatch: 'full' }
    ]
  },
  { path: 'home', component: HomeComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'agent-dashboard', component: AgentDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
