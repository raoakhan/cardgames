import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { CardComponent, CardModel } from '../../../shared/components/card/card.component';
import { SolitaireService, SolitaireGameState } from '../../../core/services/games/solitaire.service';

@Component({
  selector: 'app-solitaire',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="solitaire-container">
      <div class="game-header">
        <div class="game-title">
          <h1>Solitaire</h1>
        </div>
        <div class="game-stats">
          <div class="stat">
            <span class="stat-label">Time:</span>
            <span class="stat-value">{{ formatTime(time) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Moves:</span>
            <span class="stat-value">{{ moves }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Score:</span>
            <span class="stat-value">{{ score }}</span>
          </div>
        </div>
        <div class="game-controls">
          <button mat-raised-button color="primary" (click)="newGame()">
            <mat-icon>refresh</mat-icon> New Game
          </button>
          <button mat-raised-button color="warn" (click)="endGame()">
            <mat-icon>cancel</mat-icon> End Game
          </button>
        </div>
      </div>
      
      <div class="solitaire-board">
        <div class="top-row">
          <!-- Stock and Waste piles -->
          <div class="stock-waste">
            <div class="stock-pile" (click)="drawCard()">
              <div class="card-placeholder" *ngIf="stock.length === 0">
                <mat-icon>refresh</mat-icon>
              </div>
              <app-card *ngIf="stock.length > 0" [card]="createFaceDownCard()"></app-card>
              <div class="card-count" *ngIf="stock.length > 0">{{ stock.length }}</div>
            </div>
            
            <div class="waste-pile">
              <div class="card-placeholder" *ngIf="waste.length === 0"></div>
              <app-card 
                *ngIf="waste.length > 0" 
                [card]="waste[waste.length - 1]"
                (cardClick)="onWasteCardClick(waste[waste.length - 1])"
              ></app-card>
            </div>
          </div>
          
          <!-- Foundation piles -->
          <div class="foundation-piles">
            <div 
              *ngFor="let foundation of foundations; let i = index" 
              class="foundation-pile"
              (click)="onFoundationPileClick(i)"
            >
              <div class="card-placeholder" *ngIf="foundation.length === 0">
                <div class="suit-placeholder" [innerHTML]="getSuitSymbol(i)"></div>
              </div>
              <app-card 
                *ngIf="foundation.length > 0" 
                [card]="foundation[foundation.length - 1]"
              ></app-card>
            </div>
          </div>
        </div>
        
        <!-- Tableau piles -->
        <div class="tableau-piles">
          <div 
            *ngFor="let pile of tableau; let i = index" 
            class="tableau-pile"
            (click)="onTableauPileClick(i)"
          >
            <div class="card-placeholder" *ngIf="pile.length === 0"></div>
            <div class="tableau-cards" *ngIf="pile.length > 0">
              <ng-container *ngFor="let card of pile; let cardIndex = index">
                <app-card 
                  [card]="card" 
                  [style.top.px]="cardIndex * 20"
                  (cardClick)="onTableauCardClick(i, card)"
                ></app-card>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Win dialog -->
      <div class="win-dialog" *ngIf="hasWon">
        <div class="win-content">
          <h2>Congratulations!</h2>
          <p>You've won the game!</p>
          <p class="stats">
            Time: {{ formatTime(time) }}<br>
            Moves: {{ moves }}<br>
            Score: {{ score }}
          </p>
          <button mat-raised-button color="primary" (click)="newGame()">
            Play Again
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .solitaire-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #2c8338;
      color: white;
      padding: 20px;
      position: relative;
    }
    
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }
    
    .game-title h1 {
      margin: 0;
      font-size: 1.8rem;
    }
    
    .game-stats {
      display: flex;
      gap: 20px;
    }
    
    .stat {
      background-color: rgba(0, 0, 0, 0.15);
      padding: 5px 15px;
      border-radius: 4px;
    }
    
    .stat-label {
      font-weight: bold;
      margin-right: 5px;
    }
    
    .game-controls {
      display: flex;
      gap: 10px;
    }
    
    .solitaire-board {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }
    
    .top-row {
      display: flex;
      justify-content: space-between;
      gap: 40px;
      height: 150px;
    }
    
    .stock-waste {
      display: flex;
      gap: 20px;
    }
    
    .stock-pile, .waste-pile, .foundation-pile {
      width: 100px;
      height: 140px;
      position: relative;
    }
    
    .card-placeholder {
      width: 100%;
      height: 100%;
      border: 2px dashed rgba(255, 255, 255, 0.4);
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .suit-placeholder {
      font-size: 2rem;
      opacity: 0.4;
    }
    
    .card-count {
      position: absolute;
      top: -10px;
      right: -10px;
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.8rem;
    }
    
    .foundation-piles {
      display: flex;
      gap: 20px;
    }
    
    .tableau-piles {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      flex: 1;
    }
    
    .tableau-pile {
      flex: 1;
      min-width: 100px;
      position: relative;
      height: 300px;
    }
    
    .tableau-cards {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .tableau-cards app-card {
      position: absolute;
      width: 100%;
      transition: top 0.2s ease-out;
    }
    
    .win-dialog {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .win-content {
      background-color: white;
      color: #333;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .win-content h2 {
      margin-top: 0;
      color: #2c8338;
    }
    
    .stats {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      text-align: left;
      font-family: monospace;
      font-size: 1.1rem;
    }
  `]
})
export class SolitaireComponent implements OnInit, OnDestroy {
  private gameStateSubscription?: Subscription;
  
  // Game state
  foundations: CardModel[][] = [[], [], [], []];
  tableau: CardModel[][] = [[], [], [], [], [], [], []];
  stock: CardModel[] = [];
  waste: CardModel[] = [];
  
  // Game statistics
  moves: number = 0;
  time: number = 0;
  score: number = 0;
  
  // Game status
  isComplete: boolean = false;
  hasWon: boolean = false;
  
  // Card selection tracking
  selectedCard: { card: CardModel, source: 'waste' | 'tableau', pileIndex?: number } | null = null;
  
  constructor(private solitaireService: SolitaireService) { }
  
  ngOnInit(): void {
    this.startNewGame();
  }
  
  ngOnDestroy(): void {
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
    }
  }
  
  /**
   * Start a new game
   */
  startNewGame(): void {
    this.gameStateSubscription = this.solitaireService
      .initializeGame()
      .subscribe(state => {
        if (state) {
          this.updateGameState(state);
        }
      });
  }
  
  /**
   * Update component state from game state
   */
  private updateGameState(state: SolitaireGameState): void {
    this.foundations = state.foundations;
    this.tableau = state.tableau;
    this.stock = state.stock;
    this.waste = state.waste;
    this.moves = state.moves;
    this.time = state.time;
    this.score = state.score;
    this.isComplete = state.isComplete;
    this.hasWon = state.hasWon;
    
    // Reset selection when state changes
    this.selectedCard = null;
  }
  
  /**
   * Create a face-down card representation for the stock pile
   */
  createFaceDownCard(): CardModel {
    return {
      suit: 'spades',
      value: 'A',
      faceUp: false,
      id: 'stock',
      selectable: true
    };
  }
  
  /**
   * Format time display (mm:ss)
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Get suit symbol for foundation placeholders
   */
  getSuitSymbol(index: number): string {
    switch (index) {
      case 0: return '♥'; // Hearts
      case 1: return '♦'; // Diamonds
      case 2: return '♣'; // Clubs
      case 3: return '♠'; // Spades
      default: return '';
    }
  }
  
  /**
   * Draw a card from the stock pile
   */
  drawCard(): void {
    this.solitaireService.drawCard();
    this.selectedCard = null;
  }
  
  /**
   * Handle click on a waste card
   */
  onWasteCardClick(card: CardModel): void {
    // Deselect if already selected
    if (this.selectedCard && 
        this.selectedCard.source === 'waste' && 
        this.selectedCard.card.id === card.id) {
      this.selectedCard = null;
      return;
    }
    
    // Select the card
    this.selectedCard = {
      card,
      source: 'waste'
    };
  }
  
  /**
   * Handle click on a tableau card
   */
  onTableauCardClick(pileIndex: number, card: CardModel): void {
    // If card isn't face up or selectable, ignore click
    if (!card.faceUp || !card.selectable) return;
    
    // If we have a selected card, try to move it to this pile
    if (this.selectedCard) {
      // Can't move to the same pile
      if (this.selectedCard.source === 'tableau' && this.selectedCard.pileIndex === pileIndex) {
        this.selectedCard = null;
        return;
      }
      
      if (this.selectedCard.source === 'waste') {
        this.solitaireService.moveWasteCard(this.selectedCard.card.id!, 'tableau', pileIndex);
      } else if (this.selectedCard.source === 'tableau') {
        this.solitaireService.moveTableauCard(
          this.selectedCard.pileIndex!, 
          this.selectedCard.card.id!, 
          'tableau', 
          pileIndex
        );
      }
      
      this.selectedCard = null;
      return;
    }
    
    // Otherwise, select this card
    this.selectedCard = {
      card,
      source: 'tableau',
      pileIndex
    };
  }
  
  /**
   * Handle click on an empty tableau pile
   */
  onTableauPileClick(pileIndex: number): void {
    // If we have a selected card, try to move it to this pile
    if (this.selectedCard) {
      if (this.selectedCard.source === 'waste') {
        this.solitaireService.moveWasteCard(this.selectedCard.card.id!, 'tableau', pileIndex);
      } else if (this.selectedCard.source === 'tableau') {
        this.solitaireService.moveTableauCard(
          this.selectedCard.pileIndex!, 
          this.selectedCard.card.id!, 
          'tableau', 
          pileIndex
        );
      }
      
      this.selectedCard = null;
    }
  }
  
  /**
   * Handle click on a foundation pile
   */
  onFoundationPileClick(foundationIndex: number): void {
    // If we have a selected card, try to move it to this foundation
    if (this.selectedCard) {
      if (this.selectedCard.source === 'waste') {
        this.solitaireService.moveWasteCard(this.selectedCard.card.id!, 'foundation', foundationIndex);
      } else if (this.selectedCard.source === 'tableau') {
        this.solitaireService.moveTableauCard(
          this.selectedCard.pileIndex!, 
          this.selectedCard.card.id!, 
          'foundation', 
          foundationIndex
        );
      }
      
      this.selectedCard = null;
    }
  }
  
  /**
   * Start a new game
   */
  newGame(): void {
    this.solitaireService.resetGame();
  }
  
  /**
   * End the current game
   */
  endGame(): void {
    this.solitaireService.endGame();
  }
}
