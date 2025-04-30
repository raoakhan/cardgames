import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatInputModule, 
    MatSelectModule,
    MatDialogModule
  ],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1>Welcome to Card Games</h1>
          <p>Play classic card games with friends. Text, audio, and video chat available. Watch videos and news while you play!</p>
          
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="showCreateRoomForm = true">Create Room</button>
            <button mat-raised-button color="accent" routerLink="/lobby">Join Game</button>
          </div>
        </div>
      </div>
      
      <div class="create-room-section" *ngIf="showCreateRoomForm">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Create a Game Room</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="createRoomForm" (ngSubmit)="createRoom()">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Room Name</mat-label>
                  <input matInput formControlName="roomName" placeholder="Enter a name for your room">
                  <mat-error *ngIf="createRoomForm.get('roomName')?.invalid">Room name is required</mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Game Type</mat-label>
                  <mat-select formControlName="gameType">
                    <mat-option value="hearts">Hearts</mat-option>
                    <mat-option value="spades">Spades</mat-option>
                    <mat-option value="solitaire">Solitaire</mat-option>
                  </mat-select>
                  <mat-error *ngIf="createRoomForm.get('gameType')?.invalid">Game type is required</mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Your Name</mat-label>
                  <input matInput formControlName="playerName" placeholder="Enter your name">
                  <mat-error *ngIf="createRoomForm.get('playerName')?.invalid">Your name is required</mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-actions">
                <button mat-button type="button" (click)="showCreateRoomForm = false">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="createRoomForm.invalid">Create Room</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="games-showcase">
        <h2>Our Games</h2>
        <div class="games-grid">
          <mat-card class="game-card">
            <img mat-card-image src="assets/images/hearts.jpg" alt="Hearts">
            <mat-card-content>
              <h3>Hearts</h3>
              <p>Classic trick-taking card game where you want to avoid taking hearts and especially the Queen of Spades.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="game-card">
            <img mat-card-image src="assets/images/spades.jpg" alt="Spades">
            <mat-card-content>
              <h3>Spades</h3>
              <p>Strategic trick-taking game where spades are always trumps. Play with a partner to fulfill your bid.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="game-card">
            <img mat-card-image src="assets/images/solitaire.jpg" alt="Solitaire">
            <mat-card-content>
              <h3>Solitaire</h3>
              <p>Single-player game where you build up four foundation piles in ascending order by suit.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <div class="features-section">
        <h2>Unique Features</h2>
        <div class="features-grid">
          <div class="feature">
            <mat-icon>videocam</mat-icon>
            <h3>Integrated Video Chat</h3>
            <p>See and talk to your friends while playing. Makes online games feel just like playing in person.</p>
          </div>
          
          <div class="feature">
            <mat-icon>picture_in_picture_alt</mat-icon>
            <h3>Floating Mini-Player</h3>
            <p>Watch YouTube videos, news, or other content while playing games. Never miss important updates.</p>
          </div>
          
          <div class="feature">
            <mat-icon>devices</mat-icon>
            <h3>Mobile Friendly</h3>
            <p>Play on any device. Our responsive design works great on desktop, tablet, and mobile.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .hero-section {
      padding: 60px 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 40px;
      text-align: center;
    }
    
    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 20px;
      color: #3f51b5;
    }
    
    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .action-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    
    .create-room-section {
      max-width: 600px;
      margin: 0 auto 40px;
    }
    
    .form-row {
      margin-bottom: 20px;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
    
    .games-showcase, .features-section {
      margin-bottom: 60px;
    }
    
    .games-showcase h2, .features-section h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #3f51b5;
    }
    
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .game-card {
      transition: transform 0.3s ease;
    }
    
    .game-card:hover {
      transform: translateY(-10px);
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .feature {
      text-align: center;
      padding: 20px;
    }
    
    .feature mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #3f51b5;
      margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class HomeComponent {
  showCreateRoomForm = false;
  createRoomForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router
  ) {
    this.createRoomForm = this.fb.group({
      roomName: ['', [Validators.required]],
      gameType: ['hearts', [Validators.required]],
      playerName: ['', [Validators.required]]
    });
  }
  
  createRoom(): void {
    if (this.createRoomForm.valid) {
      const { roomName, gameType, playerName } = this.createRoomForm.value;
      
      this.gameService.createRoom(roomName, gameType, playerName).subscribe({
        next: (response) => {
          // Save room and player info
          this.gameService.setRoom(response.room);
          this.gameService.setPlayer(response.player);
          
          // Navigate to the game room
          this.router.navigate(['/game', response.room.room_id]);
        },
        error: (error) => {
          console.error('Error creating room:', error);
          // You might want to display an error message here
        }
      });
    }
  }
}
