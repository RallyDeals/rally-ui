import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevRoleSwitcher } from './shared/components/dev-role-switcher/dev-role-switcher';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevRoleSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('rally-ui');
}
