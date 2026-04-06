import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatBot } from '../../pages/chat-bot/chat-bot';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, ChatBot],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidget {
  showChatbot = false;
  hiddenRoutes = ['/login'];

  constructor(public router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showChatbot = false;
      });
  }

  get shouldShowWidget(): boolean {
    return !this.hiddenRoutes.includes(this.router.url);
  }

  toggleChatbot(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.showChatbot = !this.showChatbot;
  }

  closeChatbot(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.showChatbot = false;
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.showChatbot = false;
  }
}