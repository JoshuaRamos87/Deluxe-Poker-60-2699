import { Component, signal } from '@angular/core';
import { DeviceShellComponent } from './components/device-shell/device-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DeviceShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  showRules = signal(false);

  toggleRules() {
    this.showRules.update(v => !v);
  }
}
