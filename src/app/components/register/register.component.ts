import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/authService';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    firstName: [Validators.required, Validators.minLength(1)],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  errorMessage = '';
  isLoading = false;

  onSubmit() {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Паролі не співпадають';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = {
      firstName: this.registerForm.value.firstName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Помилка реєстрації';
        this.isLoading = false;
      }
    });
  }
}