import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { GameService } from '../../core/services/game.service';
import { ChatService } from '../../core/services/chat.service';
import { Room, Player, ChatMessage } from '../../core/models/game.model';
import { CardComponent, CardModel } from '../../shared/components/card/card.component';
import { FloatingPlayerComponent } from '../../shared/components/floating-player/floating-player.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule,
    CardComponent,
    FloatingPlayerComponent
  ],
  template: `
    <div class="game-room-container">
      <div class="game-header">
        <h1>{{ room?.name || 'Game Room' }}</h1>
        <div class="game-info">
          <span class="game-type">{{ room?.game_type | titlecase }}</span>
          <span class="player-count">{{ room?.players?.length || 0 }} Players</span>
        </div>
        <div class="game-actions">
          <button mat-icon-button matTooltip="Open media player" (click)="showFloatingPlayer = true">
            <mat-icon>picture_in_picture_alt</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Leave game" routerLink="/lobby">
            <mat-icon>exit_to_app</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="game-table-container">
        <div class="game-table">
          <!-- Opponent area (top) -->
          <div class="opponent-area">
            <ng-container *ngIf="getPlayerAtPosition(2)">
              <div class="player opponent">
                <div class="player-avatar">
                  <mat-icon [matBadge]="getCardCount(2)" matBadgeColor="accent">person</mat-icon>
                </div>
                <div class="player-name">{{ getPlayerAtPosition(2)?.display_name }}</div>
                <div class="player-cards">
                  <app-card 
                    *ngFor="let card of getPlayerCards(2)" 
                    [card]="card">
                  </app-card>
                </div>
              </div>
            </ng-container>
          </div>
          
          <!-- Side players (left and right) -->
          <div class="side-players">
            <!-- Left player -->
            <ng-container *ngIf="getPlayerAtPosition(1)">
              <div class="player left-player">
                <div class="player-avatar">
                  <mat-icon [matBadge]="getCardCount(1)" matBadgeColor="accent">person</mat-icon>
                </div>
                <div class="player-name">{{ getPlayerAtPosition(1)?.display_name }}</div>
                <div class="player-cards">
                  <app-card 
                    *ngFor="let card of getPlayerCards(1)" 
                    [card]="card">
                  </app-card>
                </div>
              </div>
            </ng-container>
            
            <!-- Center play area -->
            <div class="play-area">
              <ng-container *ngIf="gameStarted">
                <div class="played-cards">
                  <app-card 
                    *ngFor="let card of playedCards" 
                    [card]="card">
                  </app-card>
                </div>
                
                <div class="deck" *ngIf="showDeck" (click)="drawCard()">
                  <app-card [card]="deckCard"></app-card>
                </div>
              </ng-container>
              
              <div class="game-start" *ngIf="!gameStarted">
                <button mat-raised-button color="primary" (click)="startGame()" [disabled]="!canStartGame()">
                  Start Game
                </button>
                <p *ngIf="!canStartGame()">Waiting for more players...</p>
              </div>
            </div>
            
            <!-- Right player -->
            <ng-container *ngIf="getPlayerAtPosition(3)">
              <div class="player right-player">
                <div class="player-avatar">
                  <mat-icon [matBadge]="getCardCount(3)" matBadgeColor="accent">person</mat-icon>
                </div>
                <div class="player-name">{{ getPlayerAtPosition(3)?.display_name }}</div>
                <div class="player-cards">
                  <app-card 
                    *ngFor="let card of getPlayerCards(3)" 
                    [card]="card">
                  </app-card>
                </div>
              </div>
            </ng-container>
          </div>
          
          <!-- Current player area (bottom) -->
          <div class="current-player-area">
            <ng-container *ngIf="currentPlayer">
              <div class="player current-player">
                <div class="player-avatar">
                  <mat-icon [matBadge]="getCardCount(0)" matBadgeColor="accent">person</mat-icon>
                </div>
                <div class="player-name">{{ currentPlayer.display_name }}</div>
                <div class="player-cards">
                  <app-card 
                    *ngFor="let card of playerCards" 
                    [card]="card"
                    (cardClick)="playCard($event)">
                  </app-card>
                </div>
              </div>
            </ng-container>
            
            <div class="game-controls" *ngIf="gameStarted">
              <button mat-raised-button color="accent" (click)="drawCard()" [disabled]="!isCurrentPlayerTurn()">
                Draw Card
              </button>
              <button mat-raised-button color="primary" (click)="endTurn()" [disabled]="!isCurrentPlayerTurn()">
                End Turn
              </button>
            </div>
          </div>
        </div>
        
        <!-- Chat and player list sidebar -->
        <div class="game-sidebar">
          <mat-card>
            <mat-tab-group>
              <mat-tab label="Chat">
                <div class="chat-container">
                  <div class="chat-messages" #chatMessages>
                    <div class="message" *ngFor="let message of chatMessages$ | async" 
                         [ngClass]="{'own-message': message.sender_id === currentPlayer?.id}">
                      <span class="message-sender">{{ message.sender }}</span>
                      <span class="message-time">{{ message.timestamp | date:'shortTime' }}</span>
                      <div class="message-content">{{ message.message }}</div>
                    </div>
                  </div>
                  <div class="chat-input">
                    <mat-form-field appearance="outline">
                      <mat-label>Type a message</mat-label>
                      <input matInput [(ngModel)]="chatMessage" (keyup.enter)="sendChatMessage()" placeholder="Type here...">
                      <button mat-icon-button matSuffix (click)="sendChatMessage()">
                        <mat-icon>send</mat-icon>
                      </button>
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>
              <mat-tab label="Players">
                <div class="players-list">
                  <div class="player-item" *ngFor="let player of room?.players">
                    <mat-icon [color]="player.is_host ? 'accent' : ''">
                      {{ player.is_host ? 'stars' : 'person' }}
                    </mat-icon>
                    <span class="player-name">{{ player.display_name }}</span>
                    <span class="player-seat">Seat {{ player.seat_position + 1 }}</span>
                    <span class="player-status" *ngIf="currentTurnPlayer?.id === player.id">
                      Current Turn
                    </span>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>
      </div>
      
      <!-- Floating media player -->
      <app-floating-player *ngIf="showFloatingPlayer"></app-floating-player>
    </div>
  `,
  styles: [`
    .game-room-container {
      height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .game-header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #3f51b5;
    }
    
    .game-info {
      display: flex;
      gap: 16px;
    }
    
    .game-type, .player-count {
      padding: 4px 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    
    .game-table-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .game-table {
      flex: 1;
      background-color: #2c8338;
      padding: 20px;
      display: flex;
      flex-direction: column;
      position: relative;
      border-radius: 0 0 0 16px;
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
    }
    
    .opponent-area, .side-players, .current-player-area {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 16px;
    }
    
    .opponent-area, .current-player-area {
      height: 25%;
    }
    
    .side-players {
      flex: 1;
      display: flex;
      justify-content: space-between;
    }
    
    .play-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .played-cards {
      display: flex;
      justify-content: center;
      gap: 8px;
      min-height: 168px;
    }
    
    .deck {
      margin-top: 20px;
      cursor: pointer;
    }
    
    .player {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }
    
    .left-player, .right-player {
      width: 140px;
    }
    
    .player-avatar {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background-color: #fff;
      border-radius: 50%;
      margin-bottom: 8px;
    }
    
    .player-name {
      font-size: 0.875rem;
      color: white;
      margin-bottom: 8px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }
    
    .player-cards {
      display: flex;
      gap: 4px;
      min-height: 168px;
    }
    
    .current-player .player-cards {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 16px;
    }
    
    .game-controls {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }
    
    .game-sidebar {
      width: 300px;
      padding: 16px;
      background-color: #f5f5f5;
      border-left: 1px solid #e0e0e0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: calc(100vh - 200px);
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    
    .message {
      margin-bottom: 12px;
      padding: 8px 12px;
      background-color: #e0e0e0;
      border-radius: 8px;
      max-width: 80%;
      position: relative;
    }
    
    .own-message {
      background-color: #d1e7ff;
      margin-left: auto;
    }
    
    .message-sender {
      font-weight: bold;
      font-size: 0.75rem;
      display: block;
      margin-bottom: 4px;
    }
    
    .message-time {
      font-size: 0.7rem;
      color: #666;
      position: absolute;
      top: 8px;
      right: 12px;
    }
    
    .message-content {
      word-break: break-word;
    }
    
    .chat-input {
      padding: 16px;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .players-list {
      padding: 16px;
    }
    
    .player-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .player-item mat-icon {
      margin-right: 8px;
    }
    
    .player-seat {
      margin-left: auto;
      color: #666;
      font-size: 0.875rem;
    }
    
    .player-status {
      margin-left: 16px;
      padding: 2px 8px;
      background-color: #3f51b5;
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
    }
    
    .game-start {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .game-start p {
      color: white;
    }
    
    @media (max-width: 1024px) {
      .game-table-container {
        flex-direction: column;
      }
      
      .game-sidebar {
        width: 100%;
        height: 300px;
      }
    }
  `]
})
export class GameRoomComponent implements OnInit, OnDestroy {
  @ViewChild('chatMessages') chatMessagesContainer?: ElementRef;
  
  room: Room | null = null;
  currentPlayer: Player | null = null;
  currentTurnPlayer: Player | null = null;
  
  gameStarted = false;
  showFloatingPlayer = false;
  showDeck = true;
  
  playerCards: CardModel[] = [];
  playedCards: CardModel[] = [];
  
  deckCard: CardModel = { suit: 'hearts', value: 'A', faceUp: false };
  
  chatMessage = '';
  chatMessages$ = this.chatService.messages$;
  
  private roomId: string = '';
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private chatService: ChatService
  ) {}
  
  ngOnInit(): void {
    // Get room ID from route params
    this.route.paramMap.subscribe(params => {
      this.roomId = params.get('roomId') || '';
      
      if (this.roomId) {
        // Get current player and room from service
        const savedPlayer = this.gameService.player$.subscribe(player => {
          this.currentPlayer = player;
          
          if (player) {
            // Connect to WebSockets
            this.connectToGame();
          }
        });
        
        this.subscriptions.push(savedPlayer);
      }
    });
    
    // Subscribe to game state updates
    const gameStateSubscription = this.gameService.gameState$.subscribe(state => {
      if (state) {
        console.log('Game state updated:', state);
        this.handleGameStateUpdate(state);
      }
    });
    
    this.subscriptions.push(gameStateSubscription);
  }
  
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Disconnect from WebSockets
    this.gameService.disconnectFromGameSocket();
    this.chatService.disconnectFromChatSocket();
  }
  
  connectToGame(): void {
    if (this.roomId && this.currentPlayer) {
      // Connect to game socket
      this.gameService.connectToGameSocket(this.roomId, this.currentPlayer.id);
      
      // Connect to chat socket
      this.chatService.connectToChatSocket(
        this.roomId,
        this.currentPlayer.display_name,
        this.currentPlayer.id
      );
      
      // For demo: initialize with sample data
      this.initializeDemoGame();
    }
  }
  
  // This is a placeholder for demonstration
  initializeDemoGame(): void {
    // Sample room data
    this.room = {
      id: 1,
      room_id: this.roomId,
      name: 'Demo Game Room',
      game_type: 'hearts',
      created_at: new Date().toISOString(),
      is_active: true,
      players: [
        {
          id: 1,
          display_name: this.currentPlayer?.display_name || 'Player 1',
          room: 1,
          seat_position: 0,
          is_host: true,
          is_bot: false
        },
        {
          id: 2,
          display_name: 'Player 2',
          room: 1,
          seat_position: 1,
          is_host: false,
          is_bot: true
        },
        {
          id: 3,
          display_name: 'Player 3',
          room: 1,
          seat_position: 2,
          is_host: false,
          is_bot: true
        }
      ]
    };
    
    // Set current player in game
    if (this.currentPlayer) {
      this.room.players[0].id = this.currentPlayer.id;
    }
    
    // Initialize player cards for demo
    this.playerCards = [
      { suit: 'hearts', value: 2, faceUp: true, selectable: true },
      { suit: 'hearts', value: 10, faceUp: true, selectable: true },
      { suit: 'diamonds', value: 'K', faceUp: true, selectable: true },
      { suit: 'clubs', value: 7, faceUp: true, selectable: true },
      { suit: 'spades', value: 'A', faceUp: true, selectable: true }
    ];
    
    // Set current turn to the first player (user)
    this.currentTurnPlayer = this.room.players[0];
  }
  
  handleGameStateUpdate(state: any): void {
    // Handle game state updates from the server
    console.log('Handling game state update:', state);
    
    // You would process the state update here
    // For demo, we'll just log it
    
    if (state.event === 'player_joined') {
      // Handle player join
    } else if (state.event === 'game_started') {
      this.gameStarted = true;
    } else if (state.event === 'card_played') {
      // Handle card played
    } else if (state.event === 'turn_ended') {
      // Handle turn end
    }
  }
  
  getPlayerAtPosition(position: number): Player | undefined {
    return this.room?.players.find(p => p.seat_position === position);
  }
  
  getPlayerCards(position: number): CardModel[] {
    // In a real implementation, this would come from the server
    // For demo, we'll show face-down cards for opponents
    if (position === 0) {
      return this.playerCards;
    } else {
      // Generate some face-down cards for opponents
      const count = this.getCardCount(position);
      return Array(count).fill(null).map(() => (
        { suit: 'hearts', value: 'A', faceUp: false }
      ));
    }
  }
  
  getCardCount(position: number): number {
    // In a real implementation, this would come from the server
    // For demo, we'll use random numbers
    const counts = [5, 4, 5, 3];
    return counts[position];
  }
  
  isCurrentPlayerTurn(): boolean {
    return this.currentTurnPlayer?.id === this.currentPlayer?.id;
  }
  
  canStartGame(): boolean {
    return this.room?.players.length >= 2;
  }
  
  startGame(): void {
    // In a real implementation, this would send a message to the server
    console.log('Starting game...');
    this.gameStarted = true;
    
    // For demo, we'll update the UI directly
    this.gameService.setRoom(this.room!);
  }
  
  playCard(card: CardModel): void {
    if (!this.isCurrentPlayerTurn()) {
      return;
    }
    
    console.log('Playing card:', card);
    
    // In a real implementation, this would send a message to the server
    // For demo, we'll update the UI directly
    
    // Add card to played cards
    this.playedCards.push({...card});
    
    // Remove card from player's hand
    this.playerCards = this.playerCards.filter(c => 
      !(c.suit === card.suit && c.value === card.value)
    );
    
    // For demo, end turn automatically
    this.endTurn();
  }
  
  drawCard(): void {
    if (!this.isCurrentPlayerTurn()) {
      return;
    }
    
    console.log('Drawing card...');
    
    // In a real implementation, this would send a message to the server
    // For demo, we'll update the UI directly
    
    // Add a random card to player's hand
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
    
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    
    this.playerCards.push({
      suit: randomSuit,
      value: randomValue,
      faceUp: true,
      selectable: true
    });
  }
  
  endTurn(): void {
    if (!this.isCurrentPlayerTurn()) {
      return;
    }
    
    console.log('Ending turn...');
    
    // In a real implementation, this would send a message to the server
    // For demo, we'll update the UI directly
    
    // Find the next player
    const currentIndex = this.room?.players.findIndex(p => p.id === this.currentTurnPlayer?.id) || 0;
    const nextIndex = (currentIndex + 1) % (this.room?.players.length || 1);
    
    this.currentTurnPlayer = this.room?.players[nextIndex] || null;
    
    // Clear played cards after all players have played
    if (nextIndex === 0) {
      this.playedCards = [];
    }
  }
  
  sendChatMessage(): void {
    if (!this.chatMessage.trim() || !this.currentPlayer) {
      return;
    }
    
    this.chatService.sendMessage(
      this.chatMessage,
      this.currentPlayer.display_name,
      this.currentPlayer.id
    );
    
    this.chatMessage = '';
    
    // Scroll to bottom of chat
    setTimeout(() => {
      if (this.chatMessagesContainer) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }
}
