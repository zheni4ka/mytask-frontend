import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }),
    );
  }

  loginWithGoogle(idToken: string | undefined): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { idToken });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data); 
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); 
  }

  refreshToken(): Observable<any> {
    const tokens = {
      accessToken: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, tokens).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      }),
    );
  }
}
