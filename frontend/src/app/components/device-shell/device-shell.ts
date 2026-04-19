import { Component } from '@angular/core';
import { LcdScreenComponent } from '../lcd-screen/lcd-screen';
import { ButtonBoardComponent } from '../button-board/button-board';

@Component({
  selector: 'app-device-shell',
  standalone: true,
  imports: [LcdScreenComponent, ButtonBoardComponent],
  templateUrl: './device-shell.html',
  styleUrl: './device-shell.scss'
})
export class DeviceShellComponent {}
