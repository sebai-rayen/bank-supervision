import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidget } from './shared/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}