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
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
