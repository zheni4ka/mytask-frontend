import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';

@Component({
  selector: 'app-root',
  imports: [LoginComponent, RouterOutlet],
  templateUrl: './app.component.html',
})
export class App {
  protected readonly title = signal('mytask-frontend');
}
