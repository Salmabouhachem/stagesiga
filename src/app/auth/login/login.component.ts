import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.http.post<any>('http://localhost:8080/api/auth/login', loginData)
        .subscribe({
          next: (response) => {
            // Stocker les infos dans localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('prenom', response.prenom);
            localStorage.setItem('nom', response.nom);
            localStorage.setItem('telephone', response.telephone);
            localStorage.setItem('role', response.role);

            // Redirection selon le rôle
            switch (response.role) {
              case 'ROLE_ADMIN':
                this.router.navigate(['/admin-dashboard']);
                break;
              case 'ROLE_AGENT':
                this.router.navigate(['/agent-dashboard']);
                break;
              case 'ROLE_CLIENT':
                this.router.navigate(['/client-dashboard']);
                break;
              default:
                this.errorMessage = 'Rôle inconnu';
                break;
            }
          },
          error: (err) => {
            console.error('Login failed:', err);
            this.errorMessage = 'Email ou mot de passe incorrect';
          }
        });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
    }
  }
}
