import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CardComponent, CardModel } from '../../../shared/components/card/card.component';
import { HeartsService, HeartsGameState, HeartsPlayer } from '../../../core/services/games/hearts.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-hearts',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <div class="hearts-game-container">
      <div class="game-info">
        <h2 class="game-title">Hearts</h2>
        <div class="score-container">
          <div *ngFor="let player of players" class="player-score" [class.active]="player.id === currentPlayerId">
            <span class="player-name">{{ player.name }}</span>
            <span class="player-score-value" [matBadge]="player.score" matBadgeOverlap="false">Score</span>
          </div>
        </div>
        
        <div class="game-status">
          <ng-container [ngSwitch]="gamePhase">
            <div *ngSwitchCase="'passing'" class="status-message">
              <p>Pass 3 cards {{ getPassingDirectionText() }}</p>
              <p *ngIf="cardsToPass.length > 0">Selected: {{ cardsToPass.length }}/3</p>
            </div>
            <div *ngSwitchCase="'playing'" class="status-message">
              <p>{{ getCurrentPlayerText() }}</p>
              <p>Trick: {{ currentTrick + 1 }}</p>
              <p *ngIf="heartsBroken" class="hearts-broken">Hearts Broken</p>
            </div>
            <div *ngSwitchCase="'scoring'" class="status-message">
              <p>Round Complete!</p>
              <button mat-raised-button color="primary" (click)="startNextRound()">Next Round</button>
            </div>
            <div *ngSwitchCase="'finished'" class="status-message">
              <p>Game Over!</p>
              <p *ngIf="winner">{{ winner.name }} wins with {{ winner.score }} points!</p>
              <button mat-raised-button color="primary" (click)="resetGame()">Play Again</button>
            </div>
          </ng-container>
        </div>
      </div>
      
      <!-- Game Board -->
      <div class="game-board">
        <!-- Opponents -->
        <div class="opponents-container">
          <div *ngFor="let player of getOpponents()" class="opponent">
            <div class="player-area">
              <div class="player-name">{{ player.name }}</div>
              <div class="card-count" matTooltip="{{ player.hand.length }} cards">
                <span>{{ player.hand.length }}</span>
              </div>
              <div *ngIf="player.currentCard" class="player-current-card">
                <app-card [card]="player.currentCard"></app-card>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Center/Table -->
        <div class="table-container">
          <div class="cards-on-table">
            <app-card *ngFor="let card of cardsOnTable" [card]="card"></app-card>
          </div>
        </div>
        
        <!-- Current Player -->
        <div class="current-player-container">
          <div class="player-hand">
            <app-card 
              *ngFor="let card of currentPlayerHand" 
              [card]="card"
              (cardClick)="onCardSelect(card)"
            ></app-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hearts-game-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 20px;
      background-color: #1a5f2a;
      color: white;
    }
    
    .game-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }
    
    .game-title {
      margin: 0;
      font-size: 2rem;
      color: white;
    }
    
    .score-container {
      display: flex;
      gap: 20px;
    }
    
    .player-score {
      padding: 8px 16px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    
    .player-score.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: bold;
    }
    
    .player-name {
      margin-right: 8px;
    }
    
    .game-status {
      padding: 10px 20px;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      text-align: center;
    }
    
    .hearts-broken {
      color: #ff4081;
      font-weight: bold;
    }
    
    .game-board {
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
    }
    
    .opponents-container {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
    }
    
    .opponent {
      text-align: center;
    }
    
    .player-area {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .card-count {
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
    }
    
    .table-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      margin: 0 auto;
      width: 80%;
    }
    
    .cards-on-table {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .current-player-container {
      margin-top: 20px;
    }
    
    .player-hand {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 20px;
    }
    
    /* Card hover effects */
    .player-hand app-card {
      transition: transform 0.2s ease-in-out;
    }
    
    .player-hand app-card:hover {
      transform: translateY(-20px);
    }
  `]
})
export class HeartsComponent implements OnInit, OnDestroy {
  private gameStateSubscription?: Subscription;
  private roomId: string = '';
  
  // Game state
  gameState: HeartsGameState | null = null;
  players: HeartsPlayer[] = [];
  currentPlayerId: string = '';
  cardsOnTable: CardModel[] = [];
  gamePhase: 'passing' | 'playing' | 'scoring' | 'finished' = 'passing';
  currentTrick: number = 0;
  heartsBroken: boolean = false;
  passingDirection: 'left' | 'right' | 'across' | 'hold' = 'left';
  cardsToPass: CardModel[] = [];
  roundNumber: number = 1;
  winner?: HeartsPlayer;
  
  // Current player info (normally would be from auth service)
  currentPlayer = {
    id: 'player1',
    name: 'You'
  };
  
  currentPlayerHand: CardModel[] = [];
  
  constructor(
    private heartsService: HeartsService,
    private route: ActivatedRoute,
    private webSocketService: WebSocketService
  ) { }
  
  ngOnInit(): void {
    // Get room ID from route
    this.route.params.subscribe(params => {
      this.roomId = params['roomId'];
      
      // In a real app, we would connect to the WebSocket here
      // this.connectToGameSocket();
      
      // For demo, we'll just start a local game
      this.initializeLocalGame();
    });
  }
  
  ngOnDestroy(): void {
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
    
    // Disconnect WebSocket
    // this.webSocketService.disconnect();
  }
  
  /**
   * Initialize a local game for testing
   */
  private initializeLocalGame(): void {
    const playerIds = ['player1', 'player2', 'player3', 'player4'];
    const playerNames = ['You', 'Player 2', 'Player 3', 'Player 4'];
    
    this.gameStateSubscription = this.heartsService
      .initializeGame(playerIds, playerNames)
      .subscribe(state => {
        if (state) {
          this.updateGameState(state);
        }
      });
  }
  
  /**
   * Connect to the game WebSocket
   */
  private connectToGameSocket(): void {
    this.webSocketService.connect(`/ws/game/${this.roomId}/`);
    
    this.webSocketService.messages$.subscribe(message => {
      if (message.type === 'game_state') {
        this.updateGameState(message.data);
      }
    });
  }
  
  /**
   * Update the component's state based on game state
   */
  private updateGameState(state: HeartsGameState): void {
    this.gameState = state;
    this.players = state.players;
    this.currentPlayerId = state.currentPlayerId;
    this.cardsOnTable = state.cardsOnTable;
    this.gamePhase = state.phase;
    this.currentTrick = state.currentTrick;
    this.heartsBroken = state.heartsBroken;
    this.passingDirection = state.passingDirection;
    this.cardsToPass = state.cardsToPass;
    this.roundNumber = state.roundNumber;
    this.winner = state.winner;
    
    // Update current player's hand
    const player = this.players.find(p => p.id === this.currentPlayer.id);
    if (player) {
      this.currentPlayerHand = player.hand.map(card => ({
        ...card,
        faceUp: true,
        selectable: this.isCardSelectable(card)
      }));
    }
  }
  
  /**
   * Determine if a card is selectable based on game state
   */
  private isCardSelectable(card: CardModel): boolean {
    if (!this.gameState) return false;
    
    if (this.gamePhase === 'passing') {
      return this.cardsToPass.length < 3;
    } else if (this.gamePhase === 'playing') {
      if (this.currentPlayerId !== this.currentPlayer.id) {
        return false;
      }
      
      // Check if card follows hearts rules
      const player = this.players.find(p => p.id === this.currentPlayer.id);
      if (player) {
        return this.heartsService['isLegalPlay'](card, player.hand, this.gameState);
      }
    }
    
    return false;
  }
  
  /**
   * Handle card selection
   */
  onCardSelect(card: CardModel): void {
    if (card.selectable) {
      this.heartsService.selectCard(this.currentPlayer.id, card.id!);
    }
  }
  
  /**
   * Get opponents (all players except current player)
   */
  getOpponents(): HeartsPlayer[] {
    return this.players.filter(p => p.id !== this.currentPlayer.id);
  }
  
  /**
   * Get text describing passing direction
   */
  getPassingDirectionText(): string {
    switch (this.passingDirection) {
      case 'left': return 'to the left';
      case 'right': return 'to the right';
      case 'across': return 'across the table';
      case 'hold': return 'hold your cards this round';
      default: return '';
    }
  }
  
  /**
   * Get text describing whose turn it is
   */
  getCurrentPlayerText(): string {
    if (this.currentPlayerId === this.currentPlayer.id) {
      return 'Your turn';
    } else {
      const player = this.players.find(p => p.id === this.currentPlayerId);
      return player ? `${player.name}'s turn` : 'Waiting...';
    }
  }
  
  /**
   * Start the next round
   */
  startNextRound(): void {
    // In a real app, this would send a message via WebSocket
    // this.webSocketService.send({ type: 'start_next_round' });
    
    // For demo, we just update locally
    if (this.gameState) {
      this.gameState.phase = 'passing';
      this.heartsService['gameState$'].next({...this.gameState});
    }
  }
  
  /**
   * Reset the game
   */
  resetGame(): void {
    this.heartsService.resetGame();
    this.initializeLocalGame();
  }
}
