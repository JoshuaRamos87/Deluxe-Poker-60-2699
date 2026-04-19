import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceShellComponent } from './components/device-shell/device-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DeviceShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showRules = signal(false);

  toggleRules() {
    this.showRules.update(v => !v);
  }
}
