import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CardModel } from '../../../shared/components/card/card.component';

export interface HeartsPlayer {
  id: string;
  name: string;
  hand: CardModel[];
  tricks: CardModel[];
  score: number;
  currentCard?: CardModel | null;
}

export interface HeartsGameState {
  players: HeartsPlayer[];
  currentPlayerId: string;
  cardsOnTable: CardModel[];
  phase: 'passing' | 'playing' | 'scoring' | 'finished';
  currentTrick: number;
  heartsBroken: boolean;
  passingDirection: 'left' | 'right' | 'across' | 'hold';
  cardsToPass: CardModel[];
  roundNumber: number;
  winner?: HeartsPlayer;
}

@Injectable({
  providedIn: 'root'
})
export class HeartsService {
  private readonly TOTAL_CARDS = 52;
  private readonly CARDS_PER_PLAYER = 13;
  private readonly MAX_SCORE = 100;
  
  private gameState$ = new BehaviorSubject<HeartsGameState | null>(null);
  
  constructor() { }
  
  /**
   * Initialize a new game of Hearts
   * @param playerIds Array of player IDs
   * @param playerNames Array of player names
   * @returns Observable of the game state
   */
  initializeGame(playerIds: string[], playerNames: string[]): Observable<HeartsGameState | null> {
    if (playerIds.length !== 4 || playerNames.length !== 4) {
      console.error('Hearts requires exactly 4 players');
      return this.gameState$.asObservable();
    }
    
    // Create players
    const players: HeartsPlayer[] = playerIds.map((id, index) => ({
      id,
      name: playerNames[index],
      hand: [],
      tricks: [],
      score: 0
    }));
    
    // Determine passing direction for first round
    const passingDirection = this.getPassingDirection(1);
    
    // Initialize game state
    const initialState: HeartsGameState = {
      players,
      currentPlayerId: '',
      cardsOnTable: [],
      phase: 'passing',
      currentTrick: 0,
      heartsBroken: false,
      passingDirection,
      cardsToPass: [],
      roundNumber: 1
    };
    
    this.gameState$.next(initialState);
    
    // Deal cards
    this.dealCards();
    
    // Find player with 2 of clubs to start
    const startingPlayerId = this.findStartingPlayer();
    if (startingPlayerId) {
      const updatedState = this.gameState$.getValue()!;
      updatedState.currentPlayerId = startingPlayerId;
      this.gameState$.next(updatedState);
    }
    
    return this.gameState$.asObservable();
  }
  
  /**
   * Deal cards to all players
   */
  private dealCards(): void {
    const state = this.gameState$.getValue();
    if (!state) return;
    
    // Create deck
    const deck = this.createDeck();
    
    // Shuffle
    this.shuffleDeck(deck);
    
    // Deal cards to players
    const players = [...state.players];
    for (let i = 0; i < this.TOTAL_CARDS; i++) {
      const playerIndex = i % 4;
      const card = deck[i];
      players[playerIndex].hand.push(card);
    }
    
    // Sort each player's hand
    players.forEach(player => {
      player.hand = this.sortHand(player.hand);
    });
    
    // Update state
    state.players = players;
    this.gameState$.next(state);
  }
  
  /**
   * Create a standard deck of cards
   */
  private createDeck(): CardModel[] {
    const suits: CardModel['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const deck: CardModel[] = [];
    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          suit,
          value,
          faceUp: false,
          id: `${value}-${suit}`,
          selectable: true
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
   * Sort cards in hand by suit and value
   */
  private sortHand(hand: CardModel[]): CardModel[] {
    const suitOrder: Record<string, number> = {
      'clubs': 0,
      'diamonds': 1,
      'spades': 2,
      'hearts': 3
    };
    
    const valueOrder: Record<string, number> = {
      '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8,
      'J': 9, 'Q': 10, 'K': 11, 'A': 12
    };
    
    return [...hand].sort((a, b) => {
      if (a.suit !== b.suit) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return valueOrder[a.value.toString()] - valueOrder[b.value.toString()];
    });
  }
  
  /**
   * Find player with 2 of clubs to start the game
   */
  private findStartingPlayer(): string {
    const state = this.gameState$.getValue();
    if (!state) return '';
    
    for (const player of state.players) {
      const hasTwoOfClubs = player.hand.some(card => 
        card.suit === 'clubs' && card.value === '2'
      );
      
      if (hasTwoOfClubs) {
        return player.id;
      }
    }
    
    return '';
  }
  
  /**
   * Determine the passing direction based on round number
   */
  private getPassingDirection(roundNumber: number): HeartsGameState['passingDirection'] {
    const mod = roundNumber % 4;
    switch (mod) {
      case 1: return 'left';
      case 2: return 'right';
      case 3: return 'across';
      case 0: return 'hold';
      default: return 'left';
    }
  }
  
  /**
   * Select a card to pass or play
   * @param playerId ID of the player selecting the card
   * @param cardId ID of the selected card
   */
  selectCard(playerId: string, cardId: string): void {
    const state = this.gameState$.getValue();
    if (!state) return;
    
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    
    const player = state.players[playerIndex];
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
    
    const card = player.hand[cardIndex];
    
    if (state.phase === 'passing') {
      // Passing phase - select up to 3 cards to pass
      if (state.cardsToPass.length < 3) {
        // Add card to passing collection
        state.cardsToPass.push({...card});
        // Remove from hand
        player.hand.splice(cardIndex, 1);
      }
      
      // If 3 cards selected, ready to pass
      if (state.cardsToPass.length === 3) {
        // Logic to pass cards would go here
        // For now, just transition to playing phase
        state.phase = 'playing';
      }
    } else if (state.phase === 'playing') {
      // Playing phase - play a card if it's this player's turn
      if (state.currentPlayerId === playerId) {
        // Check if this card can be legally played
        if (this.isLegalPlay(card, player.hand, state)) {
          // Remove from hand
          player.hand.splice(cardIndex, 1);
          
          // Add to table with face up
          card.faceUp = true;
          state.cardsOnTable.push(card);
          
          // Update current player's played card
          player.currentCard = card;
          
          // Check if hearts are broken
          if (card.suit === 'hearts' && !state.heartsBroken) {
            state.heartsBroken = true;
          }
          
          // Move to next player
          const nextPlayerIndex = (playerIndex + 1) % 4;
          state.currentPlayerId = state.players[nextPlayerIndex].id;
          
          // Check if trick is complete
          if (state.cardsOnTable.length === 4) {
            // Process the completed trick
            this.processTrick();
          }
        }
      }
    }
    
    this.gameState$.next({...state});
  }
  
  /**
   * Check if a card is legal to play given the current state
   */
  private isLegalPlay(card: CardModel, hand: CardModel[], state: HeartsGameState): boolean {
    // First trick - must play 2 of clubs if you have it
    if (state.currentTrick === 0 && state.cardsOnTable.length === 0) {
      const hasTwoOfClubs = hand.some(c => c.suit === 'clubs' && c.value === '2');
      if (hasTwoOfClubs) {
        return card.suit === 'clubs' && card.value === '2';
      }
    }
    
    // If no cards on table yet, can't lead with hearts unless hearts broken or only has hearts
    if (state.cardsOnTable.length === 0) {
      if (card.suit === 'hearts' && !state.heartsBroken) {
        // Check if player only has hearts
        const onlyHasHearts = hand.every(c => c.suit === 'hearts');
        return onlyHasHearts;
      }
    }
    
    // If cards on table, must follow suit if possible
    if (state.cardsOnTable.length > 0) {
      const leadSuit = state.cardsOnTable[0].suit;
      if (card.suit !== leadSuit) {
        // Check if player has any cards of lead suit
        const hasSuit = hand.some(c => c.suit === leadSuit);
        return !hasSuit;
      }
    }
    
    // Special case for first trick - no hearts or queen of spades
    if (state.currentTrick === 0) {
      if (card.suit === 'hearts') return false;
      if (card.suit === 'spades' && card.value === 'Q') return false;
    }
    
    return true;
  }
  
  /**
   * Process a completed trick
   */
  private processTrick(): void {
    const state = this.gameState$.getValue();
    if (!state) return;
    
    // Determine trick winner
    const leadSuit = state.cardsOnTable[0].suit;
    let winningCard = state.cardsOnTable[0];
    let winningCardIndex = 0;
    
    const valueOrder: Record<string, number> = {
      '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5, '8': 6, '9': 7, '10': 8,
      'J': 9, 'Q': 10, 'K': 11, 'A': 12
    };
    
    for (let i = 1; i < state.cardsOnTable.length; i++) {
      const card = state.cardsOnTable[i];
      // Only cards of the lead suit can win
      if (card.suit === leadSuit) {
        if (valueOrder[card.value.toString()] > valueOrder[winningCard.value.toString()]) {
          winningCard = card;
          winningCardIndex = i;
        }
      }
    }
    
    // Determine the player who played the winning card
    const startingPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
    // Adjust for trick starting with a different player
    const winningPlayerIndex = (startingPlayerIndex + winningCardIndex) % 4;
    const winningPlayer = state.players[winningPlayerIndex];
    
    // Award trick to winning player
    winningPlayer.tricks.push(...state.cardsOnTable);
    
    // Calculate points for this trick
    let points = 0;
    for (const card of state.cardsOnTable) {
      if (card.suit === 'hearts') {
        points += 1;
      } else if (card.suit === 'spades' && card.value === 'Q') {
        points += 13;
      }
    }
    
    // Update player score
    winningPlayer.score += points;
    
    // Clear table and update next player
    state.cardsOnTable = [];
    state.currentPlayerId = winningPlayer.id;
    state.currentTrick += 1;
    
    // Reset current cards
    state.players.forEach(p => p.currentCard = null);
    
    // Check if round is over
    if (state.players[0].hand.length === 0) {
      // Move to scoring phase
      state.phase = 'scoring';
      
      // Check for shooting the moon
      const shootingMoon = this.checkShootingMoon();
      if (shootingMoon.success) {
        this.handleShootingMoon(shootingMoon.playerId);
      }
      
      // Check if game is over
      const gameOver = state.players.some(p => p.score >= this.MAX_SCORE);
      if (gameOver) {
        state.phase = 'finished';
        state.winner = this.determineWinner();
      } else {
        // Set up next round
        state.roundNumber += 1;
        state.passingDirection = this.getPassingDirection(state.roundNumber);
        state.phase = 'passing';
        state.currentTrick = 0;
        state.heartsBroken = false;
        state.cardsToPass = [];
        this.dealCards();
      }
    }
    
    this.gameState$.next({...state});
  }
  
  /**
   * Check if any player has "shot the moon"
   */
  private checkShootingMoon(): { success: boolean, playerId: string } {
    const state = this.gameState$.getValue();
    if (!state) return { success: false, playerId: '' };
    
    for (const player of state.players) {
      let hasAllHearts = true;
      let hasQueenOfSpades = false;
      
      // Check player's tricks for all hearts and queen of spades
      for (const card of player.tricks) {
        if (card.suit === 'hearts') {
          hasAllHearts = true;
        }
        if (card.suit === 'spades' && card.value === 'Q') {
          hasQueenOfSpades = true;
        }
      }
      
      if (hasAllHearts && hasQueenOfSpades) {
        return { success: true, playerId: player.id };
      }
    }
    
    return { success: false, playerId: '' };
  }
  
  /**
   * Handle when a player has shot the moon
   */
  private handleShootingMoon(shootingPlayerId: string): void {
    const state = this.gameState$.getValue();
    if (!state) return;
    
    // Add 26 points to all other players, or subtract 26 from shooting player
    const shooterWantsToSubtract = true; // In a real game, this would be a choice
    
    if (shooterWantsToSubtract) {
      // Find shooting player and subtract 26 points
      const shooter = state.players.find(p => p.id === shootingPlayerId);
      if (shooter) {
        shooter.score -= 26;
        if (shooter.score < 0) shooter.score = 0;
      }
    } else {
      // Add 26 points to all other players
      state.players.forEach(player => {
        if (player.id !== shootingPlayerId) {
          player.score += 26;
        }
      });
    }
    
    this.gameState$.next({...state});
  }
  
  /**
   * Determine the winner of the game
   */
  private determineWinner(): HeartsPlayer {
    const state = this.gameState$.getValue();
    if (!state) return state!.players[0];
    
    let lowestScore = Number.MAX_SAFE_INTEGER;
    let winner = state.players[0];
    
    for (const player of state.players) {
      if (player.score < lowestScore) {
        lowestScore = player.score;
        winner = player;
      }
    }
    
    return winner;
  }
  
  /**
   * Get the current game state
   */
  getGameState(): HeartsGameState | null {
    return this.gameState$.getValue();
  }
  
  /**
   * Reset the game
   */
  resetGame(): void {
    this.gameState$.next(null);
  }
}
