import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string) {
    this.snackBar.open(message, 'Закрити', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['bg-green-600', 'text-white']
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Закрити', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['bg-red-600', 'text-white']
    });
  }
}