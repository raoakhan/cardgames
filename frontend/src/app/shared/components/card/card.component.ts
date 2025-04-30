import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardModel {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string | number;
  faceUp: boolean;
  id?: string;
  selectable?: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="card"
      [ngClass]="{ 
        'card-face-down': !card.faceUp, 
        'card-selectable': card.selectable,
        'card-red': card.suit === 'hearts' || card.suit === 'diamonds',
        'card-black': card.suit === 'clubs' || card.suit === 'spades'
      }"
      (click)="onCardClick()"
    >
      <div class="card-inner" [ngClass]="{ 'card-flipped': card.faceUp }">
        <div class="card-back">
          <div class="card-pattern"></div>
        </div>
        <div class="card-front">
          <div class="card-corner top-left">
            <div class="card-value">{{ displayValue }}</div>
            <div class="card-suit" [innerHTML]="getSuitSymbol()"></div>
          </div>
          
          <div class="card-center" [innerHTML]="getSuitSymbol()"></div>
          
          <div class="card-corner bottom-right">
            <div class="card-value">{{ displayValue }}</div>
            <div class="card-suit" [innerHTML]="getSuitSymbol()"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      width: 120px;
      height: 168px; /* 3:4 aspect ratio */
      perspective: 1000px;
      cursor: default;
      user-select: none;
      position: relative;
      transition: transform 0.2s ease-in-out;
    }
    
    .card-selectable {
      cursor: pointer;
    }
    
    .card-selectable:hover {
      transform: translateY(-10px);
    }
    
    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s;
      transform-style: preserve-3d;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
    
    .card-flipped {
      transform: rotateY(0deg);
    }
    
    .card-face-down .card-inner {
      transform: rotateY(180deg);
    }
    
    .card-front, .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .card-front {
      background-color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8px;
    }
    
    .card-back {
      background-color: #2c5991;
      transform: rotateY(180deg);
    }
    
    .card-pattern {
      width: 100%;
      height: 100%;
      background-image: repeating-linear-gradient(
        45deg,
        #1e4575,
        #1e4575 10px,
        #2c5991 10px,
        #2c5991 20px
      );
    }
    
    .card-red {
      color: #e5173f;
    }
    
    .card-black {
      color: #212121;
    }
    
    .card-corner {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .card-corner.top-left {
      align-self: flex-start;
    }
    
    .card-corner.bottom-right {
      align-self: flex-end;
      transform: rotate(180deg);
    }
    
    .card-value {
      font-size: 1.5rem;
      font-weight: bold;
      line-height: 1;
    }
    
    .card-suit {
      font-size: 1.2rem;
      line-height: 1;
    }
    
    .card-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
    }
  `]
})
export class CardComponent {
  @Input() card!: CardModel;
  @Output() cardClick = new EventEmitter<CardModel>();
  
  get displayValue(): string {
    if (typeof this.card.value === 'number') {
      // For number cards
      return String(this.card.value);
    } else {
      // For face cards (J, Q, K, A)
      return this.card.value;
    }
  }
  
  getSuitSymbol(): string {
    switch (this.card.suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
      default:
        return '';
    }
  }
  
  onCardClick(): void {
    if (this.card.selectable) {
      this.cardClick.emit(this.card);
    }
  }
}
