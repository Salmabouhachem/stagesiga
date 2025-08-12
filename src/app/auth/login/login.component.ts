import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: (response) => {
      this.handleLoginSuccess(response);
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err.message;
      console.error('Erreur:', err);
    }
  });
}

  private handleLoginSuccess(response: any): void {
  this.isLoading = false;
    console.log("*****",response.data.token);
    
  if (response.data.token) {
    // Stockage du token - même si tu veux éviter localStorage, tu peux stocker en mémoire dans un service
    localStorage.setItem('auth_token', response.data.token);
  }

  if (response.data.user) {
const userToStore = {
    ...response.data.user,
    role: response.data.role,
  };
  localStorage.setItem('currentUser', JSON.stringify(userToStore));    
  }

  // Récupérer le rôle depuis la réponse (à adapter selon le format exact)
  const role = response.data.role || '';
  console.log(role);
  
  const redirectUrl = this.getRedirectUrl(role);
  this.router.navigate([redirectUrl]);
}

  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    this.errorMessage = error.error?.message || 'Échec de la connexion. Veuillez réessayer.';
  }

  private getRedirectUrl(role: string): string {
    switch(role) {
      case 'ROLE_ADMIN': return '/admin-dashboard';
      case 'ROLE_AGENT': return '/agent-dashboard';
      case 'ROLE_CLIENT': return '/client-dashboard';
      default: return '/';
    }
  }
}