import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessage } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: WebSocket | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);

  constructor() {}

  connectToChatSocket(roomId: string, senderName: string, senderId?: number): void {
    this.disconnectFromChatSocket();
    
    this.socket = new WebSocket(`${environment.wsUrl}/chat/${roomId}/`);
    
    this.socket.onopen = () => {
      console.log(`Connected to chat room ${roomId}`);
    };
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as ChatMessage;
      console.log('Chat message received:', message);
      
      // Add message to the messages array
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    };
    
    this.socket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };
    
    this.socket.onclose = () => {
      console.log('Disconnected from chat room');
    };
  }

  disconnectFromChatSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: string, sender: string, senderId?: number): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        message,
        sender,
        sender_id: senderId || null
      }));
    }
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  get messages$(): Observable<ChatMessage[]> {
    return this.messagesSubject.asObservable();
  }
}
