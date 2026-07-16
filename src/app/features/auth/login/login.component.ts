import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  errorMessage = signal('');
  isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    this.socialAuthService.authState.subscribe((user) => {
      if (user) {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.authService.loginWithGoogle(user.idToken).subscribe({
          next: (res) => {
            localStorage.setItem('token', res.token || res.accessToken);
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.isLoading.set(false);
          },
        });
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res && (res.token || res.accessToken)) {
          localStorage.setItem('token', res.token || res.accessToken);
        }
        if (res && res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken);
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
      },
    });
  }
}
