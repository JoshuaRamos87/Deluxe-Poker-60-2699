import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceShellComponent } from './components/device-shell/device-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DeviceShellComponent],
  template: '<app-device-shell></app-device-shell>',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
