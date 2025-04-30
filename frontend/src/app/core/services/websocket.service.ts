import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  // Observable streams
  public messages$ = this.messagesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  constructor() { }
  
  /**
   * Connect to a WebSocket endpoint
   * @param endpoint WebSocket endpoint path (e.g., '/ws/game/123/')
   */
  connect(endpoint: string): void {
    // Close any existing connection
    this.disconnect();
    
    // Construct WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${environment.apiUrl.replace(/^https?:\/\//, '')}${endpoint}`;
    
    // Create WebSocket
    this.socket = new WebSocket(wsUrl);
    
    // Set up event handlers
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.connectionStatusSubject.next(true);
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messagesSubject.next(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.connectionStatusSubject.next(false);
      
      // Auto-reconnect after a delay if not closed intentionally
      if (event.code !== 1000) {
        setTimeout(() => {
          this.connect(endpoint);
        }, 3000);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  /**
   * Send a message through the WebSocket
   * @param data Data to send (will be stringified)
   */
  send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('Cannot send message, WebSocket is not connected');
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      // Use 1000 code for normal closure
      this.socket.close(1000, 'Disconnected by client');
      this.socket = null;
    }
  }
  
  /**
   * Check if WebSocket is currently connected
   * @returns boolean indicating connection status
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
