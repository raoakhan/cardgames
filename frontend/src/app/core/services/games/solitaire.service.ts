import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CardModel } from '../../../shared/components/card/card.component';

export interface SolitaireGameState {
  // Foundation piles (goal piles by suit)
  foundations: CardModel[][];
  // Tableau piles (main playing area)
  tableau: CardModel[][];
  // Stock pile (face-down cards to draw from)
  stock: CardModel[];
  // Waste pile (cards drawn from stock)
  waste: CardModel[];
  // Game statistics
  moves: number;
  time: number;
  score: number;
  // Game status
  isComplete: boolean;
  hasWon: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SolitaireService {
  private readonly TOTAL_CARDS = 52;
  
  private gameState$ = new BehaviorSubject<SolitaireGameState | null>(null);
  private timerInterval: any;
  
  constructor() { }
  
  /**
   * Initialize a new game of Solitaire
   * @returns Observable of the game state
   */
  initializeGame(): Observable<SolitaireGameState | null> {
    // Initial game state
    const initialState: SolitaireGameState = {
      foundations: [[], [], [], []], // 4 empty foundation piles
      tableau: [[], [], [], [], [], [], []], // 7 tableau piles
      stock: [],
      waste: [],
      moves: 0,
      time: 0,
      score: 0,
      isComplete: false,
      hasWon: false
    };
    
    // Create and shuffle a deck
    const deck = this.createDeck();
    this.shuffleDeck(deck);
    
    // Deal cards to tableau
    this.dealTableau(deck, initialState);
    
    // Remaining cards go to stock pile
    initialState.stock = deck;
    
    // Start timer
    this.startTimer();
    
    // Set initial state
    this.gameState$.next(initialState);
    
    return this.gameState$.asObservable();
  }
  
  /**
   * Create a standard deck of cards
   */
  private createDeck(): CardModel[] {
    const suits: CardModel['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const deck: CardModel[] = [];
    let id = 0;
    
    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          suit,
          value,
          faceUp: false,
          id: `${id++}`,
          selectable: false
        });
      }
    }
    
    return deck;
  }
  
  /**
   * Shuffle a deck of cards
   */
  private shuffleDeck(deck: CardModel[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  
  /**
   * Deal cards to tableau in Solitaire format
   */
  private dealTableau(deck: CardModel[], state: SolitaireGameState): void {
    // Deal cards to tableau piles (1 to pile 1, 2 to pile 2, etc.)
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        if (deck.length === 0) break;
        
        const card = deck.pop()!;
        // Only the top card of each pile is face up initially
        card.faceUp = (j === i);
        card.selectable = (j === i);
        
        state.tableau[i].push(card);
      }
    }
  }
  
  /**
   * Start the game timer
   */
  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      const state = this.gameState$.getValue();
      if (state && !state.isComplete) {
        state.time += 1;
        this.gameState$.next({...state});
      }
    }, 1000);
  }
  
  /**
   * Draw a card from the stock pile
   */
  drawCard(): void {
    const state = this.gameState$.getValue();
    if (!state || state.isComplete) return;
    
    // If stock is empty, recycle waste pile
    if (state.stock.length === 0) {
      if (state.waste.length === 0) return;
      
      // Turn all waste cards face down and move to stock
      state.waste.forEach(card => {
        card.faceUp = false;
        card.selectable = false;
      });
      
      state.stock = [...state.waste.reverse()];
      state.waste = [];
    } else {
      // Draw top card from stock
      const card = state.stock.pop()!;
      card.faceUp = true;
      card.selectable = true;
      
      state.waste.push(card);
    }
    
    // Increment move counter
    state.moves += 1;
    
    // Update state
    this.gameState$.next({...state});
  }
  
  /**
   * Move a card from waste to tableau or foundation
   * @param cardId ID of the card to move
   * @param destination Destination type ('tableau' or 'foundation')
   * @param destIndex Index of the destination pile
   */
  moveWasteCard(cardId: string, destination: 'tableau' | 'foundation', destIndex: number): boolean {
    const state = this.gameState$.getValue();
    if (!state || state.isComplete || state.waste.length === 0) return false;
    
    const cardIndex = state.waste.findIndex(c => c.id === cardId);
    if (cardIndex === -1 || cardIndex !== state.waste.length - 1) return false;
    
    const card = state.waste[cardIndex];
    
    if (destination === 'tableau') {
      // Check if valid move to tableau
      if (!this.isValidTableauMove(card, state.tableau[destIndex])) {
        return false;
      }
      
      // Move card to tableau
      state.waste.pop();
      state.tableau[destIndex].push(card);
    } else {
      // Check if valid move to foundation
      if (!this.isValidFoundationMove(card, state.foundations[destIndex])) {
        return false;
      }
      
      // Move card to foundation
      state.waste.pop();
      state.foundations[destIndex].push(card);
      
      // Add foundation bonus points
      state.score += 10;
    }
    
    // Increment move counter
    state.moves += 1;
    
    // Check for win condition
    this.checkWinCondition(state);
    
    // Update state
    this.gameState$.next({...state});
    
    return true;
  }
  
  /**
   * Move a card between tableau piles or from tableau to foundation
   * @param fromPileIndex Source tableau pile index
   * @param cardId ID of the card to move
   * @param destination Destination type ('tableau' or 'foundation')
   * @param destIndex Index of the destination pile
   */
  moveTableauCard(
    fromPileIndex: number, 
    cardId: string, 
    destination: 'tableau' | 'foundation', 
    destIndex: number
  ): boolean {
    const state = this.gameState$.getValue();
    if (!state || state.isComplete) return false;
    
    const sourcePile = state.tableau[fromPileIndex];
    if (!sourcePile.length) return false;
    
    const cardIndex = sourcePile.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;
    
    // For tableau, we can move the card and all cards below it
    const cardsToMove = sourcePile.slice(cardIndex);
    
    if (destination === 'tableau') {
      // Can only move multiple cards within tableau
      if (!this.isValidTableauMove(cardsToMove[0], state.tableau[destIndex])) {
        return false;
      }
      
      // Move cards to destination tableau
      state.tableau[fromPileIndex] = sourcePile.slice(0, cardIndex);
      state.tableau[destIndex] = [...state.tableau[destIndex], ...cardsToMove];
    } else {
      // Can only move single cards to foundation
      if (cardsToMove.length > 1) return false;
      
      if (!this.isValidFoundationMove(cardsToMove[0], state.foundations[destIndex])) {
        return false;
      }
      
      // Move card to foundation
      state.tableau[fromPileIndex].pop();
      state.foundations[destIndex].push(cardsToMove[0]);
      
      // Add foundation bonus points
      state.score += 10;
    }
    
    // If we exposed a new card, turn it face up
    if (state.tableau[fromPileIndex].length > 0 && 
        !state.tableau[fromPileIndex][state.tableau[fromPileIndex].length - 1].faceUp) {
      state.tableau[fromPileIndex][state.tableau[fromPileIndex].length - 1].faceUp = true;
      state.tableau[fromPileIndex][state.tableau[fromPileIndex].length - 1].selectable = true;
      
      // Add points for revealing a card
      state.score += 5;
    }
    
    // Increment move counter
    state.moves += 1;
    
    // Check for win condition
    this.checkWinCondition(state);
    
    // Update state
    this.gameState$.next({...state});
    
    return true;
  }
  
  /**
   * Check if a card can be moved to a tableau pile
   */
  private isValidTableauMove(card: CardModel, destPile: CardModel[]): boolean {
    // Can place any card (typically a King) on an empty pile
    if (destPile.length === 0) {
      return card.value === 'K';
    }
    
    const topCard = destPile[destPile.length - 1];
    
    // Cards must be of alternate colors
    const isRedCard = card.suit === 'hearts' || card.suit === 'diamonds';
    const isTopCardRed = topCard.suit === 'hearts' || topCard.suit === 'diamonds';
    
    if (isRedCard === isTopCardRed) {
      return false;
    }
    
    // Cards must be in descending order (King to Ace)
    const values = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
    const cardValueIndex = values.indexOf(card.value.toString());
    const topCardValueIndex = values.indexOf(topCard.value.toString());
    
    return cardValueIndex === topCardValueIndex + 1;
  }
  
  /**
   * Check if a card can be moved to a foundation pile
   */
  private isValidFoundationMove(card: CardModel, destPile: CardModel[]): boolean {
    // First card in foundation must be an Ace
    if (destPile.length === 0) {
      return card.value === 'A';
    }
    
    const topCard = destPile[destPile.length - 1];
    
    // Cards must be of the same suit
    if (card.suit !== topCard.suit) {
      return false;
    }
    
    // Cards must be in ascending order (Ace to King)
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cardValueIndex = values.indexOf(card.value.toString());
    const topCardValueIndex = values.indexOf(topCard.value.toString());
    
    return cardValueIndex === topCardValueIndex + 1;
  }
  
  /**
   * Check if the game has been won
   */
  private checkWinCondition(state: SolitaireGameState): void {
    // Game is won if all foundation piles have 13 cards (Ace through King)
    const allFoundationsFull = state.foundations.every(pile => pile.length === 13);
    
    if (allFoundationsFull) {
      state.isComplete = true;
      state.hasWon = true;
      
      // Stop timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      
      // Calculate final score (time bonus)
      const timeBonus = Math.max(0, 700 - state.time);
      state.score += timeBonus;
    }
  }
  
  /**
   * Get current game state
   */
  getGameState(): SolitaireGameState | null {
    return this.gameState$.getValue();
  }
  
  /**
   * End the current game
   */
  endGame(): void {
    const state = this.gameState$.getValue();
    if (!state) return;
    
    state.isComplete = true;
    
    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.gameState$.next(state);
  }
  
  /**
   * Reset and start a new game
   */
  resetGame(): void {
    this.initializeGame();
  }
  
  /**
   * Clean up when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
