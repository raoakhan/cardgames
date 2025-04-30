import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { GameService } from '../../core/services/game.service';
import { Room } from '../../core/models/game.model';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatTableModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="lobby-container">
      <div class="lobby-header">
        <h1>Game Lobby</h1>
        <p>Join an existing game or <a routerLink="/">create your own</a>.</p>
      </div>
      
      <div class="search-bar">
        <mat-form-field appearance="outline">
          <mat-label>Search games</mat-label>
          <input matInput [(ngModel)]="searchTerm" placeholder="Search by room name or game type">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
      
      <div class="rooms-grid" *ngIf="rooms.length > 0">
        <mat-card class="room-card" *ngFor="let room of filteredRooms">
          <mat-card-header>
            <mat-icon mat-card-avatar>casino</mat-icon>
            <mat-card-title>{{ room.name }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip-set>
                <mat-chip>{{ room.game_type | titlecase }}</mat-chip>
                <mat-chip color="primary" [matBadge]="room.players.length" matBadgePosition="after">Players</mat-chip>
              </mat-chip-set>
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p>Created: {{ room.created_at | date:'short' }}</p>
            
            <div class="seats-container">
              <div 
                class="seat" 
                *ngFor="let i of [0, 1, 2, 3]" 
                [ngClass]="{'occupied': isOccupied(room, i)}"
                [matTooltip]="getPlayerName(room, i) || 'Empty seat'">
                <mat-icon>{{ isOccupied(room, i) ? 'person' : 'person_outline' }}</mat-icon>
                <span *ngIf="isOccupied(room, i)">{{ getPlayerName(room, i) }}</span>
                <span *ngIf="!isOccupied(room, i)">Seat {{ i + 1 }}</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions align="end">
            <button mat-button color="primary" (click)="joinRoom(room, 0)" [disabled]="isOccupied(room, 0)">Seat 1</button>
            <button mat-button color="primary" (click)="joinRoom(room, 1)" [disabled]="isOccupied(room, 1)">Seat 2</button>
            <button mat-button color="primary" (click)="joinRoom(room, 2)" [disabled]="isOccupied(room, 2)">Seat 3</button>
            <button mat-button color="primary" (click)="joinRoom(room, 3)" [disabled]="isOccupied(room, 3)">Seat 4</button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div class="no-rooms" *ngIf="rooms.length === 0">
        <mat-card>
          <mat-card-content class="text-center">
            <mat-icon class="large-icon">sentiment_dissatisfied</mat-icon>
            <h2>No active game rooms found</h2>
            <p>Be the first to create a room and invite others to play!</p>
            <button mat-raised-button color="primary" routerLink="/">Create Room</button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .lobby-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .lobby-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .lobby-header h1 {
      color: #3f51b5;
      margin-bottom: 10px;
    }
    
    .search-bar {
      margin-bottom: 30px;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    
    .room-card {
      position: relative;
      height: 100%;
      transition: transform 0.2s ease;
    }
    
    .room-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    .seats-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    
    .seat {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      background-color: #f5f5f5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .seat.occupied {
      background-color: #e8f5e9;
      border-left: 3px solid #4caf50;
    }
    
    .seat mat-icon {
      margin-right: 8px;
    }
    
    .no-rooms {
      margin-top: 50px;
    }
    
    .text-center {
      text-align: center;
    }
    
    .large-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 20px;
      color: #9e9e9e;
    }
    
    @media (max-width: 768px) {
      .rooms-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LobbyComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  searchTerm: string = '';
  private roomSubscription?: Subscription;
  
  constructor(private gameService: GameService) {}
  
  ngOnInit(): void {
    // Poll for room updates every 5 seconds
    this.roomSubscription = interval(5000)
      .pipe(
        switchMap(() => this.gameService.getRooms())
      )
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
        },
        error: (err) => {
          console.error('Failed to fetch rooms:', err);
        }
      });
    
    // Initial fetch
    this.gameService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
      },
      error: (err) => {
        console.error('Failed to fetch rooms:', err);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
  }
  
  get filteredRooms(): Room[] {
    if (!this.searchTerm.trim()) {
      return this.rooms;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.rooms.filter(room => 
      room.name.toLowerCase().includes(term) || 
      room.game_type.toLowerCase().includes(term)
    );
  }
  
  isOccupied(room: Room, seatPosition: number): boolean {
    return room.players.some(player => player.seat_position === seatPosition);
  }
  
  getPlayerName(room: Room, seatPosition: number): string | null {
    const player = room.players.find(player => player.seat_position === seatPosition);
    return player ? player.display_name : null;
  }
  
  joinRoom(room: Room, seatPosition: number): void {
    // For demo, just using a default player name
    // In a real app, you might prompt the user for their name
    const playerName = 'Guest_' + Math.floor(Math.random() * 1000);
    
    this.gameService.joinRoom(room.room_id, seatPosition, playerName).subscribe({
      next: (player) => {
        // Save the player info
        this.gameService.setPlayer(player);
        
        // Navigate to the game room
        window.location.href = `/game/${room.room_id}`;
      },
      error: (err) => {
        console.error('Failed to join room:', err);
        // Show error message
      }
    });
  }
}
