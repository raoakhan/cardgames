import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room, Player, GameSession, GameAction } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private socket: WebSocket | null = null;
  private roomSubject = new BehaviorSubject<Room | null>(null);
  private playerSubject = new BehaviorSubject<Player | null>(null);
  private gameStateSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  // REST API methods
  createRoom(name: string, gameType: string, playerName?: string): Observable<{room: Room, player: Player}> {
    return this.http.post<{room: Room, player: Player}>(`${environment.apiUrl}/rooms/create/`, {
      name,
      game_type: gameType,
      player_name: playerName
    });
  }

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${environment.apiUrl}/rooms/`);
  }

  joinRoom(roomId: string, seatPosition: number, playerName?: string): Observable<Player> {
    return this.http.post<Player>(`${environment.apiUrl}/rooms/${roomId}/join/`, {
      seat_position: seatPosition,
      player_name: playerName
    });
  }

  // WebSocket methods
  connectToGameSocket(roomId: string, playerId: number): void {
    this.disconnectFromGameSocket();
    
    this.socket = new WebSocket(`${environment.wsUrl}/game/${roomId}/`);
    
    this.socket.onopen = () => {
      console.log(`Connected to game room ${roomId}`);
      
      // Send join game message
      if (this.socket) {
        this.socket.send(JSON.stringify({
          action_type: 'join_game',
          player_id: playerId,
          data: {}
        }));
      }
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Game update received:', data);
      
      // Update game state based on event type
      this.gameStateSubject.next(data);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.socket.onclose = () => {
      console.log('Disconnected from game room');
    };
  }

  disconnectFromGameSocket(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Game actions
  playCard(playerId: number, cardData: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action_type: 'play_card',
        player_id: playerId,
        data: cardData
      }));
    }
  }

  drawCard(playerId: number): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action_type: 'draw_card',
        player_id: playerId,
        data: {}
      }));
    }
  }

  endTurn(playerId: number): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action_type: 'end_turn',
        player_id: playerId,
        data: {}
      }));
    }
  }

  // Getters for observables
  get room$(): Observable<Room | null> {
    return this.roomSubject.asObservable();
  }

  get player$(): Observable<Player | null> {
    return this.playerSubject.asObservable();
  }

  get gameState$(): Observable<any> {
    return this.gameStateSubject.asObservable();
  }

  // Setters for local state
  setRoom(room: Room): void {
    this.roomSubject.next(room);
  }

  setPlayer(player: Player): void {
    this.playerSubject.next(player);
  }
}
