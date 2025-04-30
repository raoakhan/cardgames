import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'lobby',
    loadComponent: () => import('./pages/lobby/lobby.component').then(m => m.LobbyComponent)
  },
  {
    path: 'game/:roomId',
    loadComponent: () => import('./pages/game-room/game-room.component').then(m => m.GameRoomComponent)
  },
  {
    path: 'games/hearts/:roomId',
    loadComponent: () => import('./pages/games/hearts/hearts.component').then(m => m.HeartsComponent)
  },
  {
    path: 'games/solitaire',
    loadComponent: () => import('./pages/games/solitaire/solitaire.component').then(m => m.SolitaireComponent)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
