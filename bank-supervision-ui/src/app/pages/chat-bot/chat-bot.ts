import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-bot.html',
  styleUrls: ['./chat-bot.css']
})
export class ChatBot implements AfterViewInit {
  @ViewChild('chatBody') private chatBody!: ElementRef<HTMLDivElement>;

  @Input() embedded = false;
  @Output() closePanel = new EventEmitter<void>();

  userMessage = '';
  isLoading = false;

  messages: ChatMessage[] = [
    {
      text: 'Bonjour, je suis votre assistant IA. Comment puis-je vous aider ?',
      sender: 'bot',
      time: this.getCurrentTime()
    }
  ];

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const text = this.userMessage.trim();
    if (!text || this.isLoading) return;

    this.messages.push({
      text,
      sender: 'user',
      time: this.getCurrentTime()
    });

    this.userMessage = '';
    this.isLoading = true;
    this.scrollToBottom();

    setTimeout(() => {
      this.messages.push({
        text: this.getBotReply(text),
        sender: 'bot',
        time: this.getCurrentTime()
      });

      this.isLoading = false;
      this.scrollToBottom();
    }, 700);
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private getBotReply(message: string): string {
    const msg = message.toLowerCase();

    if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello')) {
      return 'Bonjour, je suis à votre disposition.';
    }

    if (msg.includes('alerte') || msg.includes('critique')) {
      return 'Les alertes critiques nécessitent une vérification immédiate.';
    }

    if (msg.includes('serveur') || msg.includes('server')) {
      return 'Vous pouvez consulter l’état des serveurs ainsi que les métriques CPU et RAM.';
    }

    if (msg.includes('application') || msg.includes('app')) {
      return 'La page Application affiche les incidents et l’état des services surveillés.';
    }

    if (msg.includes('paramètre') || msg.includes('settings')) {
      return 'Dans Paramètres, vous pouvez ajuster vos préférences utilisateur.';
    }

    if (msg.includes('merci')) {
      return 'Avec plaisir.';
    }

    return 'Je suis prêt à vous aider concernant les serveurs, les alertes, les applications et les paramètres.';
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (!this.chatBody?.nativeElement) return;

      const container = this.chatBody.nativeElement;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
        return;
      }

      container.scrollTop = container.scrollHeight;
    }, 50);
  }
}
