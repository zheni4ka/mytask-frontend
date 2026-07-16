import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  
  if (req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  let authReq = req;
  
  if (token) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        
        const newToken = res.token || res.accessToken;
        const newRefreshToken = res.refreshToken;
        
        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        refreshTokenSubject.next(newToken);
        
        return next(addTokenHeader(request, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenHeader(request, token as string)))
    );
  }
}