import { Component, signal } from '@angular/core';
import { DeviceShellComponent } from './components/device-shell/device-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DeviceShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(window:keydown.escape)': 'onEscape()',
  },
})
export class App {
  showRules = signal(false);

  toggleRules() {
    this.showRules.update(v => !v);
  }

  onEscape() {
    if (this.showRules()) {
      this.showRules.set(false);
    }
  }
}
