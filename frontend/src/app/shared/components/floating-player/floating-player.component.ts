import { Component, OnInit, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-floating-player',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <div 
      class="floating-player" 
      [ngClass]="{'minimized': isMinimized}"
      [ngStyle]="{'z-index': isMinimized ? 100 : 1000}"
      #playerContainer
      cdkDrag
      cdkDragBoundary="body">
      
      <div class="player-header" cdkDragHandle>
        <div class="player-title">{{ title }}</div>
        <div class="player-controls">
          <button mat-icon-button (click)="toggleMinimize()">
            <mat-icon>{{ isMinimized ? 'keyboard_arrow_up' : 'minimize' }}</mat-icon>
          </button>
          <button mat-icon-button [matMenuTriggerFor]="contentMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <button mat-icon-button (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="player-content" *ngIf="!isMinimized">
        <ng-container [ngSwitch]="contentType">
          <!-- YouTube embed -->
          <iframe 
            *ngSwitchCase="'youtube'"
            [src]="safeUrl" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
          
          <!-- News embed -->
          <iframe 
            *ngSwitchCase="'news'"
            [src]="safeUrl" 
            frameborder="0">
          </iframe>
          
          <!-- Default message -->
          <div *ngSwitchDefault class="no-content">
            <p>Select content to display</p>
            <button mat-raised-button color="primary" [matMenuTriggerFor]="contentMenu">
              Choose Content
            </button>
          </div>
        </ng-container>
      </div>
      
      <mat-menu #contentMenu="matMenu">
        <button mat-menu-item (click)="setContent('youtube', 'https://www.youtube.com/embed/videoseries?list=PLbpi6ZahtOH6GFmPECs2fBF_9PszVuXH8')">
          <mat-icon>smart_display</mat-icon>
          <span>YouTube Trending</span>
        </button>
        <button mat-menu-item (click)="setContent('news', 'https://news.google.com/embed')">
          <mat-icon>newspaper</mat-icon>
          <span>Google News</span>
        </button>
        <button mat-menu-item (click)="setContent('news', 'https://www.bbc.com/news/av/embed/world')">
          <mat-icon>newspaper</mat-icon>
          <span>BBC News</span>
        </button>
        <!-- Add more content sources as needed -->
      </mat-menu>
    </div>
  `,
  styles: [`
    .floating-player {
      position: absolute;
      width: 360px;
      height: 240px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      resize: both;
      min-width: 320px;
      min-height: 180px;
      max-width: 800px;
      max-height: 600px;
      right: 20px;
      bottom: 20px;
    }
    
    .floating-player.minimized {
      height: 48px !important;
      min-height: 48px;
      resize: none;
    }
    
    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background-color: #3f51b5;
      color: white;
      cursor: move;
    }
    
    .player-title {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .player-controls {
      display: flex;
      align-items: center;
    }
    
    .player-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .no-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 20px;
      text-align: center;
    }
  `]
})
export class FloatingPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('playerContainer') playerContainer!: ElementRef;
  
  @Input() initialX: number = window.innerWidth - 400;
  @Input() initialY: number = window.innerHeight - 300;
  
  isMinimized = false;
  contentType: 'youtube' | 'news' | null = null;
  safeUrl: SafeResourceUrl | null = null;
  title: string = 'Media Player';
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit(): void {}
  
  ngAfterViewInit(): void {
    // Set initial position
    const element = this.playerContainer.nativeElement;
    element.style.right = `${this.initialX}px`;
    element.style.bottom = `${this.initialY}px`;
  }
  
  setContent(type: 'youtube' | 'news', url: string): void {
    this.contentType = type;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    // Set title based on content type
    if (type === 'youtube') {
      this.title = 'YouTube';
    } else if (type === 'news') {
      this.title = url.includes('bbc') ? 'BBC News' : 'Google News';
    }
    
    // Ensure player is visible
    if (this.isMinimized) {
      this.isMinimized = false;
    }
  }
  
  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }
  
  close(): void {
    // Instead of removing the component, we'll hide it
    const element = this.playerContainer.nativeElement;
    element.style.display = 'none';
  }
}
