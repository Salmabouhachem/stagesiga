import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AdminDashboardComponent } from './admin/dashboard-admin/dashboard-admin.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import{ClientDashboardComponent} from'./client/dashboard-client/dashboard-client.component';
import { CommonModule } from '@angular/common';
import { AgentDashboardComponent } from './agent/dashboard-agent/dashboard-agent.component';
import { CentresListComponent } from './admin/centres/centres-list.component';
import { UsersListComponent } from './admin/users/users-list.component';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    AdminDashboardComponent,
    ClientDashboardComponent,
    AgentDashboardComponent,
    CentresListComponent,
    UsersListComponent

  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
        MatCardModule,    // Pour mat-card, mat-card-content etc.
    MatButtonModule,  // Pour mat-button
    MatIconModule,    // Pour mat-icon
    MatListModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot([])
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }