import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: '', 
    loadComponent: () => import('./features/assignments/pages/todo-list/todo-list.component').then(m => m.TodoListComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: '**', 
    redirectTo: '' 
  },
];