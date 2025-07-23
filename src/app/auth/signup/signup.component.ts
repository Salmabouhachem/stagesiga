import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
  nom: ['', [Validators.required, Validators.maxLength(50)]],
  prenom: ['', [Validators.required, Validators.maxLength(50)]],
  telephone: ['', [
    Validators.required,
    Validators.pattern(/^\+?[\d\s-]+$/),
    Validators.maxLength(20)
  ]],
  email: ['', [Validators.required, Validators.email]],
  role: ['CLIENT', [Validators.required]],   // ✅ AJOUT ICI
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  ]],
  confirmPassword: ['', Validators.required]
}, { validator: this.passwordMatchValidator });

  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid || this.isLoading) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword, ...userData } = this.signupForm.value;

    this.authService.signup(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(err);
        console.error('Registration error:', err);
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err.status === 0) return 'Impossible de se connecter au serveur';
    if (err.error?.message) return err.error.message;
    if (err.error?.errors) return Object.values(err.error.errors).join(', ');
    return 'Une erreur est survenue lors de l\'inscription';
  }
}