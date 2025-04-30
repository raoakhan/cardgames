import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary">
        <span>Card Games</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button aria-label="Toggle theme">
          <mat-icon>dark_mode</mat-icon>
        </button>
      </mat-toolbar>
      
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    .main-content {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'Card Games';
}
