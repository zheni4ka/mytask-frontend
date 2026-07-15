import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { authGuard } from './core/guards/auth-guard';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: TodoListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
