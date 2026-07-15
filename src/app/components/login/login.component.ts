import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/authService';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService); 

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage = '';
  isLoading = false;

  ngOnInit() {
    this.socialAuthService.authState.subscribe((user) => {
      if (user) {
        this.isLoading = true;
        
        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: (res) => {
            localStorage.setItem('token', res.token || res.accessToken); 
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Помилка авторизації через Google';
            this.isLoading = false;
          }
        });
      }
    });
  }
  
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.errorMessage = 'Неправильний email або пароль. Спробуйте ще раз.';
        console.error('Помилка входу:', err);
      }
    });
  }
}