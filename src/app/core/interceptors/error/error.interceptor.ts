import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Сталася невідома помилка сервера.';

      if (error.error instanceof ErrorEvent) {
        errorMsg = `Помилка мережі: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMsg = error.error?.message || 'Неправильний запит (400). Перевірте дані.';
            break;
          case 401:
            errorMsg = 'Час сесії минув. Будь ласка, увійдіть знову.';
            localStorage.removeItem('token');
            router.navigate(['/login']);
            break;
          case 403:
            errorMsg = 'У вас немає доступу до цієї дії.';
            break;
          case 404:
            errorMsg = 'Запитуваний ресурс не знайдено.';
            break;
          case 500:
            errorMsg = 'Внутрішня помилка сервера. Ми вже працюємо над цим.';
            break;
          default:
            if (error.error?.message) {
              errorMsg = error.error.message;
            }
            break;
        }
      }

      notificationService.showError(errorMsg);

      return throwError(() => error);
    })
  );
};