import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  isClicked = false; // <-- Pour l'animation clic bouton

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signupForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?\d{1,3}[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3}$/)]],
      role: ['ROLE_CLIENT', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      control.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    console.log('Form validity:', this.signupForm.valid);
    if (!this.signupForm || this.signupForm.invalid) {
      console.log('Form is invalid, marking as touched');
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = {
      nom: this.signupForm.get('nom')?.value,
      prenom: this.signupForm.get('prenom')?.value,
      email: this.signupForm.get('email')?.value,
      telephone: this.signupForm.get('telephone')?.value,
      role: this.signupForm.get('role')?.value,
      password: this.signupForm.get('password')?.value
    };

    this.authService.signup(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Inscription réussie', response);
        this.router.navigate(['/login']);  // <-- Redirection après succès
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur lors de l\'inscription';
        console.error('Erreur d\'inscription', err);
      }
    });
  }

  // Pour gérer l’animation de clic bouton
  onButtonClick() {
    this.isClicked = true;
    setTimeout(() => this.isClicked = false, 150);
  }
}
